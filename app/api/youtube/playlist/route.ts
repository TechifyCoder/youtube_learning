import { z } from 'zod'
import { auth } from '@/lib/auth'
import { parseYouTubeUrl, fetchPlaylist, fetchVideoDetails, YouTubeError } from '@/lib/youtube'

// ─────────────────────────────────────────────────────────────
// GET /api/youtube/playlist?url=...
// Fetches playlist or single video metadata from YouTube API.
// Returns: YouTubePlaylistData
// ─────────────────────────────────────────────────────────────

const querySchema = z.object({
  url: z.string().min(1, 'URL is required'),
})

export async function GET(req: Request) {
  try {
    // Auth check
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate query param
    const { searchParams } = new URL(req.url)
    const parsed = querySchema.safeParse({ url: searchParams.get('url') ?? '' })

    if (!parsed.success) {
      return Response.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { url } = parsed.data
    const parsed_url = parseYouTubeUrl(url)

    if (parsed_url.type === 'invalid') {
      return Response.json(
        { error: 'Invalid YouTube URL. Paste a playlist or video URL.', code: 'INVALID_URL' },
        { status: 400 }
      )
    }

    if (parsed_url.type === 'playlist') {
      const data = await fetchPlaylist(parsed_url.id)
      return Response.json(data)
    }

    // Single video — wrap it as a 1-video "playlist"
    if (parsed_url.type === 'video') {
      const video = await fetchVideoDetails(parsed_url.id)
      return Response.json({
        playlistId: null,
        title: video.title,
        thumbnail: video.thumbnail,
        videos: [video],
        totalDurationSeconds: video.durationSeconds,
        videoCount: 1,
      })
    }
  } catch (error) {
    if (error instanceof YouTubeError) {
      const statusMap: Record<string, number> = {
        INVALID_URL: 400,
        NOT_FOUND: 404,
        PRIVATE: 403,
        QUOTA_EXCEEDED: 429,
        UNKNOWN: 500,
      }
      return Response.json(
        { error: error.message, code: error.code },
        { status: statusMap[error.code] ?? 500 }
      )
    }

    console.error('[GET /api/youtube/playlist]', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
