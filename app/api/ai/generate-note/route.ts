import { auth } from '@/lib/auth'
import { fetchTranscript } from '@/lib/transcript'
import { GoogleGenAI } from '@google/genai'
import { z } from 'zod'

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
})

const generateSchema = z.object({
  youtubeVideoId: z.string(),
  startSeconds: z.number().int().min(0),
  endSeconds: z.number().int().min(0),
})

export const POST = auth(async (req: any) => {
  try {
    if (!req.auth?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!process.env.GEMINI_API_KEY) {
      return Response.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 500 })
    }

    const body = await req.json()
    const parsed = generateSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
    }

    const { youtubeVideoId, startSeconds, endSeconds } = parsed.data

    if (startSeconds >= endSeconds) {
      return Response.json({ error: 'Start time must be less than end time' }, { status: 400 })
    }

    // 1. Fetch raw transcript
    const rawTranscript = await fetchTranscript(youtubeVideoId)
    if (!rawTranscript || rawTranscript.length === 0) {
      return Response.json({ error: 'Could not fetch transcript for this video' }, { status: 404 })
    }

    // 2. Filter transcript by time range
    // Each transcript object has `offset` in milliseconds
    const filteredBlocks = rawTranscript.filter((block: any) => {
      const blockStart = block.offset / 1000
      const blockEnd = blockStart + (block.duration / 1000)
      
      // We include the block if it overlaps at all with our range
      return blockEnd > startSeconds && blockStart < endSeconds
    })

    if (filteredBlocks.length === 0) {
      return Response.json({ note: 'No transcript available for this specific time range.' })
    }

    const textToSummarize = filteredBlocks.map((t: any) => t.text).join(' ').replace(/\s+/g, ' ').trim()

    // 3. Ask Gemini to generate notes
    const systemPrompt = `You are a helpful learning assistant. Your task is to generate concise, clear, and highly structured study notes from the provided video transcript snippet.
Format your notes using Markdown (bullet points, bold text). Focus strictly on the key takeaways from this specific section of the video. Do NOT add information outside of the provided transcript.`

    const prompt = `${systemPrompt}\n\nTranscript Snippet (${Math.floor(startSeconds/60)}:${startSeconds%60} to ${Math.floor(endSeconds/60)}:${endSeconds%60}):\n${textToSummarize}`

    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: prompt,
    })

    const note = response.text

    return Response.json({ note })
  } catch (error) {
    console.error('[POST /api/ai/generate-note]', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
})
