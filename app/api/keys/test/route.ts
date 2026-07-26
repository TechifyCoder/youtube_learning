import { auth } from '@/lib/auth'
import { z } from 'zod'

// ─────────────────────────────────────────────────────────────
// GET /api/keys/test?type=youtube&key=xxx
// GET /api/keys/test?type=gemini&key=xxx
//
// Tests whether a YouTube Data API v3 key or Gemini API key
// is valid by making a real API call.
//
// Returns: { valid: true } or { valid: false, error: string }
// ─────────────────────────────────────────────────────────────

const querySchema = z.object({
  type: z.enum(['youtube', 'gemini']),
  key:  z.string().min(10),
})

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const parsed = querySchema.safeParse({
      type: searchParams.get('type'),
      key:  searchParams.get('key'),
    })

    if (!parsed.success) {
      return Response.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { type, key } = parsed.data

    if (type === 'youtube') {
      return testYouTubeKey(key)
    } else {
      return testGeminiKey(key)
    }
  } catch (error) {
    console.error('[GET /api/keys/test]', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ─── Test YouTube Data API v3 Key ─────────────────────────────
async function testYouTubeKey(key: string): Promise<Response> {
  try {
    // Fetch a known public video (YouTube's own channel video)
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=dQw4w9WgXcQ&key=${key}`
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })

    if (res.status === 400) {
      return Response.json({ valid: false, error: 'Invalid API key format.' })
    }

    if (res.status === 403) {
      const body = await res.json() as { error?: { errors?: Array<{ reason?: string }> } }
      const reason = body?.error?.errors?.[0]?.reason
      if (reason === 'quotaExceeded') {
        return Response.json({ valid: false, error: 'Your YouTube API quota is exceeded. Try again tomorrow.' })
      }
      if (reason === 'keyInvalid' || reason === 'forbidden') {
        return Response.json({ valid: false, error: 'API key is invalid or has insufficient permissions.' })
      }
      return Response.json({ valid: false, error: 'YouTube API access denied. Check your key restrictions.' })
    }

    if (!res.ok) {
      return Response.json({ valid: false, error: `YouTube API returned status ${res.status}.` })
    }

    const data = await res.json() as { items?: unknown[] }
    if (!data.items) {
      return Response.json({ valid: false, error: 'Unexpected YouTube API response.' })
    }

    return Response.json({ valid: true })
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      return Response.json({ valid: false, error: 'Request timed out. Check your internet connection.' })
    }
    return Response.json({ valid: false, error: 'Failed to reach YouTube API.' })
  }
}

// ─── Test Gemini API Key ───────────────────────────────────────
async function testGeminiKey(key: string): Promise<Response> {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Say "hello" in one word.' }] }],
        generationConfig: { maxOutputTokens: 10 },
      }),
      signal: AbortSignal.timeout(10000),
    })

    if (res.status === 400) {
      const body = await res.json() as { error?: { message?: string } }
      return Response.json({ valid: false, error: body?.error?.message ?? 'Invalid request.' })
    }

    if (res.status === 401 || res.status === 403) {
      const body = await res.json() as { error?: { message?: string } }
      return Response.json({ valid: false, error: body?.error?.message ?? 'Invalid Gemini API key.' })
    }

    if (res.status === 429) {
      return Response.json({ valid: false, error: 'Gemini API rate limit reached. Key is valid but try again in a minute.' })
    }

    if (!res.ok) {
      return Response.json({ valid: false, error: `Gemini API returned status ${res.status}.` })
    }

    return Response.json({ valid: true })
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      return Response.json({ valid: false, error: 'Request timed out. Check your internet connection.' })
    }
    return Response.json({ valid: false, error: 'Failed to reach Gemini API.' })
  }
}
