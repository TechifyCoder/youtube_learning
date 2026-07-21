import { z } from 'zod'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { watchProgress, videos } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { mergeSegments } from '@/lib/schedule'

// ─────────────────────────────────────────────────────────────
// POST /api/progress
// Upsert watch_progress segments and update video isCompleted state
// ─────────────────────────────────────────────────────────────

const postSchema = z.object({
  videoId: z.string().uuid(),
  segments: z.array(z.object({
    start: z.number().nonnegative(),
    end: z.number().nonnegative(),
  })),
  isCompleted: z.boolean(),
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = postSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
    }

    const { videoId, segments, isCompleted } = parsed.data
    const userId = session.user.id

    // Fetch existing progress if any
    const [existingProgress] = await db
      .select()
      .from(watchProgress)
      .where(and(eq(watchProgress.videoId, videoId), eq(watchProgress.userId, userId)))
      .limit(1)

    // Merge new segments with existing ones from DB to prevent data loss
    const dbSegments = existingProgress?.watchedSegments ? (existingProgress.watchedSegments as any[]) : []
    const mergedSegments = mergeSegments([...dbSegments, ...segments])

    // Use upsert to prevent race conditions causing duplicate key violations
    await db
      .insert(watchProgress)
      .values({
        userId,
        videoId,
        watchedSegments: mergedSegments,
        lastWatchedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [watchProgress.videoId, watchProgress.userId],
        set: {
          watchedSegments: mergedSegments,
          lastWatchedAt: new Date(),
        },
      })

    // If marked as completed, update the video table
    if (isCompleted) {
      await db
        .update(videos)
        .set({ isCompleted: true })
        .where(and(eq(videos.id, videoId), eq(videos.userId, userId)))
    }

    // Phase 6 & 7: Update streak, activity log, and check certificates
    const newSeconds = segments.reduce((acc, seg) => acc + (seg.end - seg.start), 0)
    if (newSeconds > 0 || isCompleted) {
      const { updateStreak, upsertActivityLog } = await import('@/lib/streak')
      const { checkAndGenerateCertificate } = await import('@/lib/certificate')
      const minutesWatched = Math.max(1, Math.round(newSeconds / 60))
      
      // We don't await these so we don't block the response
      updateStreak(userId).catch(console.error)
      upsertActivityLog(userId, minutesWatched, isCompleted).catch(console.error)
      
      if (isCompleted) {
        // Find playlistId for the completed video
        const [videoRow] = await db.select({ playlistId: videos.playlistId }).from(videos).where(eq(videos.id, videoId))
        if (videoRow) {
          checkAndGenerateCertificate(videoRow.playlistId, userId).catch(console.error)
        }
      }
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('[POST /api/progress]', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
