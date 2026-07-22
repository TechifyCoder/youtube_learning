import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { evaluateShortAnswer, getGeminiKey } from '@/lib/gemini'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { question, userAnswer, sampleAnswer, criteria } = await req.json()
    
    const geminiKey = await getGeminiKey()
    const result = await evaluateShortAnswer(question, userAnswer, sampleAnswer, criteria, geminiKey)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('[EVALUATE_ANSWER]', error)
    return NextResponse.json({ error: 'Failed to evaluate answer' }, { status: 500 })
  }
}
