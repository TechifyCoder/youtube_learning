import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { generateFinalQuiz, getGeminiKey } from '@/lib/gemini'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { courseTitle, videoTitles, combinedTranscript } = await req.json()
    if (!courseTitle || !videoTitles || !combinedTranscript) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const geminiKey = await getGeminiKey()
    const questions = await generateFinalQuiz(courseTitle, videoTitles, combinedTranscript, geminiKey)

    return NextResponse.json(questions)
  } catch (error: any) {
    console.error('[GENERATE_FINAL_QUIZ]', error)
    if (error.message === 'GEMINI_KEY_MISSING') {
      return NextResponse.json({ error: 'Please add your Gemini API key in Settings' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Could not generate quiz right now. Skip or try again.' }, { status: 500 })
  }
}
