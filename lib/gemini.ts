import { GoogleGenAI } from '@google/genai'

// ─────────────────────────────────────────────────────────────
// lib/gemini.ts — Google GenAI SDK Integration
// ─────────────────────────────────────────────────────────────

export async function streamAnswer(transcript: string, question: string) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is missing')
  }

  const systemPrompt = `You are LearnLoop's AI learning assistant. 
Your goal is to help the user understand the educational video they are currently watching.
You will be provided with the video's transcript. Answer the user's question accurately based *only* on the transcript provided.
If the answer is not in the transcript, politely state that the video does not seem to cover that topic.
Do not invent information. Keep your answers concise, structured, and easy to read. Use markdown formatting (bullet points, bold text) where appropriate.`

  // Fallback to gemini-1.5-flash since gemini-2.5-flash is returning 404
  const model = 'gemini-1.5-flash'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${process.env.GEMINI_API_KEY}&alt=sse`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: `Here is the transcript for the video:\n\n<transcript>\n${transcript}\n</transcript>\n\nUser Question: ${question}` }]
        }
      ]
    })
  })

  if (!response.ok) {
    const err = await response.text()
    console.error('Gemini API Error:', err)
    throw new Error(`Gemini API failed with status ${response.status}: ${err}`)
  }

  // We need to parse the SSE stream and yield only text to match the frontend expectations
  return new ReadableStream({
    async start(controller) {
      const reader = response.body?.getReader()
      if (!reader) {
        controller.close()
        return
      }

      const decoder = new TextDecoder()
      let buffer = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          
          // Keep the last partial line in the buffer
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.replace('data: ', '').trim()
              if (dataStr === '[DONE]') continue
              if (!dataStr) continue
              
              try {
                const data = JSON.parse(dataStr)
                const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
                if (text) {
                  controller.enqueue(new TextEncoder().encode(text))
                }
              } catch (e) {
                // Ignore incomplete JSON chunks in SSE
              }
            }
          }
        }
      } catch (err) {
        console.error('Gemini streaming parse error:', err)
      } finally {
        controller.close()
      }
    },
  })
}
