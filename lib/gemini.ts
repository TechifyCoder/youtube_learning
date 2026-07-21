import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function streamAnswer(
  transcript: string,
  question: string
) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  const systemPrompt = `You are LearnLoop's AI learning assistant.
Your goal is to help the user understand the educational video they are currently watching.
You will be provided with the video's transcript. Answer the user's question accurately based ONLY on the transcript.
If the answer is not present in the transcript, clearly state that the transcript does not contain the answer.
Keep answers concise and use Markdown formatting where appropriate.`;

  const stream = await ai.models.generateContentStream({
    model: "gemini-flash-latest",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `${systemPrompt}

Transcript:
${transcript}

Question:
${question}`,
          },
        ],
      },
    ],
  });



  return new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      try {
        for await (const chunk of stream) {
          const text = chunk.text;

          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
      } catch (err) {
        console.error("Gemini Stream Error:", err);
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });
}