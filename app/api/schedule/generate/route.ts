import { z } from 'zod'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { playlists, videos, scheduleDays } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { generateSchedule } from '@/lib/schedule'

// ─────────────────────────────────────────────────────────────
// POST /api/schedule/generate
// Generates the daily schedule for a playlist based on commitment
// ─────────────────────────────────────────────────────────────

const schema = z.object({
  playlistId: z.string().uuid(),
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const { playlistId } = parsed.data
    const userId = session.user.id

    // Fetch playlist
    const [playlist] = await db
      .select()
      .from(playlists)
      .where(and(eq(playlists.id, playlistId), eq(playlists.userId, userId)))
      .limit(1)

    if (!playlist) {
      return Response.json({ error: 'Playlist not found' }, { status: 404 })
    }

    // Fetch videos ordered by index
    const playlistVideos = await db
      .select()
      .from(videos)
      .where(eq(videos.playlistId, playlistId))
      .orderBy(videos.orderIndex)

    if (playlistVideos.length === 0) {
      return Response.json({ error: 'No videos found in playlist' }, { status: 400 })
    }

    // Generate schedule
    const schedule = generateSchedule(
      playlistVideos as any[], 
      playlist.commitmentDays, 
      new Date(playlist.startDate)
    )

    // Insert schedule days (sequential due to Neon HTTP limitation on transactions)
    for (const day of schedule) {
      await db.insert(scheduleDays).values({
        playlistId: playlist.id,
        userId,
        dayNumber: day.dayNumber,
        date: day.date,
        videoIds: day.videoIds,
        targetMinutes: day.targetMinutes,
        isCompleted: false,
        status: day.status,
      })
    }

    return Response.json({ success: true, count: schedule.length })
  } catch (error) {
    console.error('[POST /api/schedule/generate]', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
