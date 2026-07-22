import { z } from 'zod'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { playlists, videos as videosTable, scheduleDays } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { generateSchedule } from '@/lib/schedule'
import type { YouTubePlaylistData } from '@/types'

// ─────────────────────────────────────────────────────────────
// POST /api/playlists
// Creates a new playlist (and its videos) in the database.
// ─────────────────────────────────────────────────────────────

const createSchema = z.object({
  title: z.string().min(1),
  source: z.enum(['youtube', 'custom']),
  youtubePlaylistId: z.string().nullable(),
  thumbnail: z.string().nullable(),
  totalVideos: z.number().int().nonnegative(),
  commitmentDays: z.number().int().min(1),
  hoursPerDay: z.number().nullable(),
  startDate: z.string(), // ISO string
  deadline: z.string(),  // ISO string
  videos: z.array(z.object({
    youtubeVideoId: z.string(),
    title: z.string(),
    thumbnail: z.string().nullable(),
    durationSeconds: z.number().int().nonnegative(),
    orderIndex: z.number().int().nonnegative(),
  })),
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = createSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
    }

    const data = parsed.data

    // Neon HTTP driver doesn't support transactions natively, so we do sequential inserts
    const [insertedPlaylist] = await db
      .insert(playlists)
      .values({
        userId: session.user.id,
        title: data.title,
        source: data.source,
        youtubePlaylistId: data.youtubePlaylistId,
        thumbnail: data.thumbnail,
        totalVideos: data.totalVideos,
        commitmentDays: data.commitmentDays,
        hoursPerDay: data.hoursPerDay ? data.hoursPerDay.toString() : null,
        startDate: new Date(data.startDate).toISOString().split('T')[0]!,
        deadline: new Date(data.deadline).toISOString().split('T')[0]!,
      })
      .returning()

    if (!insertedPlaylist) throw new Error('Failed to create playlist')

    const videosToInsert = data.videos.map((v) => ({
      playlistId: insertedPlaylist.id,
      userId: session.user.id,
      youtubeVideoId: v.youtubeVideoId,
      title: v.title,
      thumbnail: v.thumbnail,
      durationSeconds: v.durationSeconds,
      orderIndex: v.orderIndex,
    }))

    if (videosToInsert.length > 0) {
      await db.insert(videosTable).values(videosToInsert)
    }

    // Phase 4: Generate Schedule
    // We need to fetch the inserted videos to get their actual DB IDs for the schedule
    const insertedVideos = await db
      .select()
      .from(videosTable)
      .where(eq(videosTable.playlistId, insertedPlaylist.id))
      .orderBy(videosTable.orderIndex)

    const schedule = generateSchedule(
      insertedVideos as any[],
      insertedPlaylist.commitmentDays,
      new Date(insertedPlaylist.startDate)
    )

    for (const day of schedule) {
      await db.insert(scheduleDays).values({
        playlistId: insertedPlaylist.id,
        dayNumber: day.dayNumber,
        date: day.date.toISOString().split('T')[0]!,
        videoIds: day.videoIds,
        targetMinutes: day.targetMinutes,
        isCompleted: false,
        status: day.status,
      })
    }

    const newPlaylist = insertedPlaylist

    return Response.json({ success: true, playlistId: newPlaylist.id })
  } catch (error) {
    console.error('[POST /api/playlists]', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ─────────────────────────────────────────────────────────────
// GET /api/playlists
// Fetches all playlists for the current user.
// ─────────────────────────────────────────────────────────────
export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userPlaylists = await db
      .select()
      .from(playlists)
      .where(eq(playlists.userId, session.user.id))
      .orderBy(desc(playlists.createdAt))

    return Response.json(userPlaylists)
  } catch (error) {
    console.error('[GET /api/playlists]', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
