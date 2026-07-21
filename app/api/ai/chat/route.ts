import { z } from 'zod'
import { auth } from '@/lib/auth'
import { streamAnswer } from '@/lib/gemini'
import { prepareTranscriptForAI } from '@/lib/transcript'

// ─────────────────────────────────────────────────────────────
// POST /api/ai/chat
// Streams Gemini's answer to a user's question using the transcript
// ─────────────────────────────────────────────────────────────

export const maxDuration = 30 // Allow max 30 seconds for streaming response (Vercel hobby plan max)

const schema = z.object({
  videoId: z.string().uuid(),
  question: z.string().min(1).max(500),
  transcript: z.string().min(1),
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const parsed = schema.safeParse(body)
    
    if (!parsed.success) {
      return new Response('Invalid payload', { status: 400 })
    }

    const { question, transcript } = parsed.data

    // Truncate transcript to fit context window safely
    const safeTranscript = prepareTranscriptForAI(transcript)

    const stream = await streamAnswer(safeTranscript, question)

    // Respond with a readable stream for streaming client fetch
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('[POST /api/ai/chat]', error)
    return new Response('Internal server error', { status: 500 })
  }
}
