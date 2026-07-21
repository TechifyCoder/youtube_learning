import Anthropic from '@anthropic-ai/sdk'

// ─────────────────────────────────────────────────────────────
// lib/claude.ts — Anthropic Claude SDK Integration
// ─────────────────────────────────────────────────────────────

// This file only runs on the server
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export async function streamAnswer(transcript: string, question: string) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is missing')
  }

  const systemPrompt = `You are LearnLoop's AI learning assistant. 
Your goal is to help the user understand the educational video they are currently watching.
You will be provided with the video's transcript. Answer the user's question accurately based *only* on the transcript provided.
If the answer is not in the transcript, politely state that the video does not seem to cover that topic.
Do not invent information. Keep your answers concise, structured, and easy to read. Use markdown formatting (bullet points, bold text) where appropriate.`

  const stream = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20240620',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Here is the transcript for the video:\n\n<transcript>\n${transcript}\n</transcript>\n\nUser Question: ${question}`
      }
    ],
    stream: true,
  })

  // Convert Anthropic stream to a standard Web ReadableStream
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            controller.enqueue(new TextEncoder().encode(chunk.delta.text))
          }
        }
      } catch (err) {
        console.error('Claude streaming error:', err)
      } finally {
        controller.close()
      }
    },
  })
}
