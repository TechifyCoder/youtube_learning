import { z } from 'zod'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { videos } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { fetchTranscript, cleanTranscript } from '@/lib/transcript'

// ─────────────────────────────────────────────────────────────
// GET /api/transcript
// Fetches the transcript for a video, caching it in the DB
// ─────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const videoId = searchParams.get('videoId')
    
    if (!videoId) {
      return Response.json({ error: 'Video ID is required' }, { status: 400 })
    }

    // 1. Check DB for cached transcript
    const [video] = await db
      .select()
      .from(videos)
      .where(and(eq(videos.id, videoId), eq(videos.userId, session.user.id)))
      .limit(1)

    if (!video) {
      return Response.json({ error: 'Video not found' }, { status: 404 })
    }

    // Return cached if it exists
    if (video.transcript) {
      return Response.json({ available: true, text: video.transcript })
    }

    // 2. Not cached, fetch from YouTube
    const rawTranscript = await fetchTranscript(video.youtubeVideoId)
    
    if (!rawTranscript || rawTranscript.length === 0) {
      return Response.json({ available: false })
    }

    const cleanText = cleanTranscript(rawTranscript)

    // 3. Cache in DB
    await db
      .update(videos)
      .set({ transcript: cleanText, updatedAt: new Date() })
      .where(eq(videos.id, video.id))

    return Response.json({ available: true, text: cleanText })

  } catch (error) {
    console.error('[GET /api/transcript]', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
