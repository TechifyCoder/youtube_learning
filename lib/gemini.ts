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

import { QuizQuestion, FinalQuizQuestion, ShortAnswerEvaluation } from '@/types'

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

export async function generateVideoQuiz(
  transcript: string,
  videoTitle: string,
  apiKey: string
): Promise<QuizQuestion[]> {

  const prompt = `
You are an expert educator. Based on the following video transcript, 
generate a quiz to test understanding.

Video Title: "${videoTitle}"

Transcript:
${transcript.slice(0, 30000)}

Generate exactly 6 questions. Return ONLY a valid JSON array, no markdown, no explanation.
Include these question types in this order:
- 4 standard questions (mcq, truefalse, fillblank)
- 2 short_answer questions for practice

Format:
[
  {
    "type": "mcq",
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0,
    "explanation": "Why this answer is correct"
  },
  {
    "type": "truefalse", 
    "question": "Statement to evaluate",
    "options": ["True", "False"],
    "correct": 0,
    "explanation": "Explanation"
  },
  {
    "type": "short_answer",
    "question": "Explain in your own words: why is X important?",
    "sampleAnswer": "A good answer would mention: point1, point2, point3",
    "evaluationCriteria": ["mentions concept A", "explains why B", "gives example"]
  }
]

Rules:
- Questions must be directly based on the transcript content
- MCQ options must all be plausible (no obviously wrong answers)
- Explanations must be helpful and educational
- Do not ask about timestamps, video production, or the presenter
- Focus on the actual concepts taught
`

  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 2048,
      }
    })
  })

  if (!res.ok) {
    const errText = await res.text()
    console.error("GEMINI API ERROR", errText)
    if (res.status === 429) throw new Error('AI rate limit exceeded. Please wait a minute and try again.')
    if (res.status === 400) throw new Error('INVALID_KEY')
    throw new Error('GEMINI_ERROR')
  }

  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

  // Strip markdown code fences if present
  let clean = text.replace(/```json|```/g, '').trim()
  try {
    const startIdx = clean.indexOf('[')
    const endIdx = clean.lastIndexOf(']')
    if (startIdx !== -1 && endIdx !== -1) {
      clean = clean.substring(startIdx, endIdx + 1)
    }
    return JSON.parse(clean) as QuizQuestion[]
  } catch (e) {
    console.error("Failed to parse Gemini response", text);
    throw new Error('GEMINI_ERROR')
  }
}

export async function generateFinalQuiz(
  courseTitle: string,
  videoTitles: string[],
  combinedTranscript: string,
  apiKey: string
): Promise<FinalQuizQuestion[]> {

  const prompt = `
You are an expert educator creating a comprehensive final assessment.

Course: "${courseTitle}"
Topics covered: ${videoTitles.join(', ')}

Combined transcript excerpts:
${combinedTranscript.slice(0, 50000)}

Generate a final course quiz with exactly 10 questions. 
Return ONLY valid JSON array, no markdown, no preamble.

Include these question types in this order:
- 3 MCQ questions (conceptual, harder than per-video quizzes)
- 2 short_answer questions (user types their understanding)
- 5 coding_practice questions (real coding challenges related to the course topic)

Format:
[
  {
    "type": "mcq",
    "question": "Advanced concept question?",
    "options": ["A", "B", "C", "D"],
    "correct": 0,
    "explanation": "Detailed explanation"
  },
  {
    "type": "short_answer",
    "question": "Explain in your own words: why is X important?",
    "sampleAnswer": "A good answer would mention: point1, point2, point3",
    "evaluationCriteria": ["mentions concept A", "explains why B", "gives example"]
  },
  {
    "type": "coding_practice",
    "question": "Write a function that does X",
    "context": "Use what you learned about Y in this course",
    "difficulty": "beginner",
    "platform_links": [
      { "name": "LeetCode", "url": "https://leetcode.com/problems/relevant-problem/" },
      { "name": "Replit", "url": "https://replit.com/new/nodejs" },
      { "name": "CodePen", "url": "https://codepen.io/pen/" }
    ],
    "hint": "Think about the Z concept from Video 3"
  }
]

For coding_practice questions:
- Make them directly relevant to the course topic
- Match difficulty to beginner/intermediate based on course content  
- LeetCode URL should link to a real, relevant problem if possible
- Replit/CodePen links can be generic new-file links
- Hints should reference actual course concepts

For short_answer questions:
- sampleAnswer should guide the AI evaluator, not be shown to user
- evaluationCriteria: 3 key points a good answer should cover
`

  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 4096,
      }
    })
  })

  if (!res.ok) {
    const errText = await res.text()
    console.error("GEMINI API ERROR", errText)
    throw new Error('GEMINI_ERROR')
  }
  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  let clean = text.replace(/```json|```/g, '').trim()
  try {
    const startIdx = clean.indexOf('[')
    const endIdx = clean.lastIndexOf(']')
    if (startIdx !== -1 && endIdx !== -1) {
      clean = clean.substring(startIdx, endIdx + 1)
    }
    return JSON.parse(clean) as FinalQuizQuestion[]
  } catch (e) {
    console.error("Failed to parse Gemini response", text);
    throw new Error('GEMINI_ERROR')
  }
}

export async function evaluateShortAnswer(
  question: string,
  userAnswer: string,
  sampleAnswer: string,
  criteria: string[],
  apiKey: string
): Promise<ShortAnswerEvaluation> {

  const prompt = `
Evaluate this student answer for a learning quiz.

Question: "${question}"
Student's answer: "${userAnswer}"
Reference answer: "${sampleAnswer}"
Evaluation criteria: ${criteria.join(', ')}

Score the answer from 0-100 and provide constructive feedback.
Return ONLY valid JSON, no markdown:
{
  "score": 75,
  "feedback": "Good answer! You correctly mentioned X and Y. You could improve by also explaining Z.",
  "criteriaMet": ["mentions concept A", "gives example"]
}

Be encouraging but honest. If answer is blank or irrelevant, score 0.
`

  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 512 }
    })
  })

  if (!res.ok) {
    const errText = await res.text()
    console.error("GEMINI API ERROR", errText)
    throw new Error('GEMINI_ERROR')
  }
  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  let clean = text.replace(/```json|```/g, '').trim()
  try {
    const startIdx = clean.indexOf('{')
    const endIdx = clean.lastIndexOf('}')
    if (startIdx !== -1 && endIdx !== -1) {
      clean = clean.substring(startIdx, endIdx + 1)
    }
    return JSON.parse(clean) as ShortAnswerEvaluation
  } catch (e) {
    console.error("Failed to parse Gemini response", text);
    throw new Error('GEMINI_ERROR')
  }
}

import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// export async function getGeminiKey(userId: string): Promise<string> {
//   const user = await db.query.users.findFirst({
//     where: eq(users.id, userId),
//     columns: { geminiApiKey: true }
//   })

//   if (user?.geminiApiKey) {
//     return user.geminiApiKey
//   }

//   if (process.env.GEMINI_API_KEY) {
//     return process.env.GEMINI_API_KEY
//   }

//   throw new Error("GEMINI_KEY_MISSING")
// }


export async function getGeminiKey(): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  return apiKey;
}