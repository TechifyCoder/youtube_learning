import { z } from 'zod'
import { auth } from '@/lib/auth'
import { fetchVideoDetails, YouTubeError } from '@/lib/youtube'

// ─────────────────────────────────────────────────────────────
// GET /api/youtube/video?videoId=...
// Fetches a single video's metadata.
// Used by MultiVideoInput for custom playlists.
// ─────────────────────────────────────────────────────────────

const querySchema = z.object({
  videoId: z.string().length(11, 'Invalid YouTube video ID'),
})

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const parsed = querySchema.safeParse({ videoId: searchParams.get('videoId') ?? '' })

    if (!parsed.success) {
      return Response.json(
        { error: 'Invalid video ID', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const video = await fetchVideoDetails(parsed.data.videoId)
    return Response.json(video)
  } catch (error) {
    if (error instanceof YouTubeError) {
      return Response.json({ error: error.message, code: error.code }, { status: 404 })
    }
    console.error('[GET /api/youtube/video]', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
