// ─────────────────────────────────────────────────────────────
// lib/youtube.ts — YouTube Data API v3 helpers
// Phase 2, Day 4
// ─────────────────────────────────────────────────────────────

import type { YouTubeVideoMeta, YouTubePlaylistData, YouTubeErrorCode } from '@/types'

// ─── Custom Error Class ──────────────────────────────────────
export class YouTubeError extends Error {
  code: YouTubeErrorCode

  constructor(message: string, code: YouTubeErrorCode) {
    super(message)
    this.name = 'YouTubeError'
    this.code = code
  }
}

// ─── URL Parsing ─────────────────────────────────────────────
/**
 * Parse a YouTube URL and extract the type + ID.
 * Handles playlist URLs, video URLs, short URLs (youtu.be).
 */
export function parseYouTubeUrl(
  url: string
): { type: 'playlist' | 'video' | 'invalid'; id: string } {
  try {
    const parsed = new URL(url.trim())
    const hostname = parsed.hostname.replace('www.', '').replace('m.', '')

    // youtu.be/<videoId>
    if (hostname === 'youtu.be') {
      const id = parsed.pathname.replace('/', '').split('?')[0]
      if (id) return { type: 'video', id }
    }

    if (hostname === 'youtube.com') {
      // Playlist URL: ?list=PLxxx
      const listId = parsed.searchParams.get('list')
      if (listId) return { type: 'playlist', id: listId }

      // Video URL: /watch?v=xxx
      const videoId = parsed.searchParams.get('v')
      if (videoId) return { type: 'video', id: videoId }

      // Short embed: /embed/<id> or /shorts/<id>
      const pathParts = parsed.pathname.split('/').filter(Boolean)
      if (
        pathParts[0] === 'embed' ||
        pathParts[0] === 'shorts' ||
        pathParts[0] === 'v'
      ) {
        const id = pathParts[1]
        if (id) return { type: 'video', id }
      }
    }
  } catch {
    // Not a valid URL
  }
  return { type: 'invalid', id: '' }
}

// ─── Duration Parser ─────────────────────────────────────────
/**
 * Convert ISO 8601 duration (PT1H23M45S) to total seconds.
 */
function parseDuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0
  const h = parseInt(match[1] ?? '0', 10)
  const m = parseInt(match[2] ?? '0', 10)
  const s = parseInt(match[3] ?? '0', 10)
  return h * 3600 + m * 60 + s
}

// ─── Fetch Single Video Details ───────────────────────────────
export async function fetchVideoDetails(videoId: string): Promise<YouTubeVideoMeta> {
  const apiKey = process.env['YOUTUBE_API_KEY']
  if (!apiKey) throw new YouTubeError('YouTube API key not configured', 'UNKNOWN')

  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`
  const res = await fetch(url, { next: { revalidate: 3600 } })

  await checkYouTubeError(res)

  const data = await res.json() as {
    items?: Array<{
      id: string
      snippet: { title: string; thumbnails: { medium?: { url: string }; default?: { url: string } } }
      contentDetails: { duration: string }
    }>
  }

  const item = data.items?.[0]
  if (!item) throw new YouTubeError('Video not found', 'NOT_FOUND')

  return {
    youtubeVideoId: item.id,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails.medium?.url ?? item.snippet.thumbnails.default?.url ?? '',
    durationSeconds: parseDuration(item.contentDetails.duration),
    orderIndex: 0,
  }
}

// ─── Fetch Full Playlist ──────────────────────────────────────
export async function fetchPlaylist(playlistId: string): Promise<YouTubePlaylistData> {
  const apiKey = process.env['YOUTUBE_API_KEY']
  if (!apiKey) throw new YouTubeError('YouTube API key not configured', 'UNKNOWN')

  // Step 1: Get playlist metadata
  const metaUrl = `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${apiKey}`
  const metaRes = await fetch(metaUrl, { next: { revalidate: 3600 } })
  await checkYouTubeError(metaRes)

  const metaData = await metaRes.json() as {
    items?: Array<{
      snippet: { title: string; thumbnails: { medium?: { url: string }; default?: { url: string } } }
    }>
  }

  const playlistMeta = metaData.items?.[0]
  if (!playlistMeta) throw new YouTubeError('Playlist not found', 'NOT_FOUND')

  // Step 2: Get all video IDs from playlist (paginated, 50 per page)
  const videoIds: string[] = []
  let nextPageToken: string | undefined

  do {
    const pageUrl = new URL('https://www.googleapis.com/youtube/v3/playlistItems')
    pageUrl.searchParams.set('part', 'snippet')
    pageUrl.searchParams.set('maxResults', '50')
    pageUrl.searchParams.set('playlistId', playlistId)
    pageUrl.searchParams.set('key', apiKey)
    if (nextPageToken) pageUrl.searchParams.set('pageToken', nextPageToken)

    const pageRes = await fetch(pageUrl.toString(), { next: { revalidate: 3600 } })
    await checkYouTubeError(pageRes)

    const pageData = await pageRes.json() as {
      items?: Array<{ snippet: { resourceId: { videoId: string }; position: number } }>
      nextPageToken?: string
    }

    for (const item of pageData.items ?? []) {
      const videoId = item.snippet.resourceId.videoId
      // Skip deleted/private videos (they have placeholder IDs)
      if (videoId && videoId !== 'deleted' && videoId.length === 11) {
        videoIds.push(videoId)
      }
    }

    nextPageToken = pageData.nextPageToken
  } while (nextPageToken)

  if (videoIds.length === 0) {
    throw new YouTubeError('Playlist is empty or all videos are private', 'NOT_FOUND')
  }

  // Step 3: Fetch video details in batches of 50 (API limit)
  const videos: YouTubeVideoMeta[] = []

  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50)
    const ids = batch.join(',')
    const detailUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${ids}&key=${apiKey}`
    const detailRes = await fetch(detailUrl, { next: { revalidate: 3600 } })
    await checkYouTubeError(detailRes)

    const detailData = await detailRes.json() as {
      items?: Array<{
        id: string
        snippet: { title: string; thumbnails: { medium?: { url: string }; default?: { url: string } } }
        contentDetails: { duration: string }
      }>
    }

    for (const item of detailData.items ?? []) {
      videos.push({
        youtubeVideoId: item.id,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium?.url ?? item.snippet.thumbnails.default?.url ?? '',
        durationSeconds: parseDuration(item.contentDetails.duration),
        orderIndex: videos.length,
      })
    }
  }

  // Re-order by original playlist order
  const orderedVideos = videos.map((v, i) => ({ ...v, orderIndex: i }))
  const totalDurationSeconds = orderedVideos.reduce((sum, v) => sum + v.durationSeconds, 0)

  return {
    playlistId,
    title: playlistMeta.snippet.title,
    thumbnail:
      playlistMeta.snippet.thumbnails.medium?.url ??
      playlistMeta.snippet.thumbnails.default?.url ??
      orderedVideos[0]?.thumbnail ?? '',
    videos: orderedVideos,
    totalDurationSeconds,
    videoCount: orderedVideos.length,
  }
}

// ─── Error Checking Helper ────────────────────────────────────
async function checkYouTubeError(res: Response): Promise<void> {
  if (res.ok) return

  if (res.status === 403) {
    let body: { error?: { errors?: Array<{ reason?: string }> } } = {}
    try { body = await res.json() } catch { /* ignore */ }
    const reason = body.error?.errors?.[0]?.reason
    if (reason === 'quotaExceeded') {
      throw new YouTubeError('YouTube API quota exceeded. Try again tomorrow.', 'QUOTA_EXCEEDED')
    }
    throw new YouTubeError('This playlist or video is private or unavailable.', 'PRIVATE')
  }

  if (res.status === 404) {
    throw new YouTubeError('Playlist or video not found.', 'NOT_FOUND')
  }

  throw new YouTubeError('Failed to fetch YouTube data.', 'UNKNOWN')
}
