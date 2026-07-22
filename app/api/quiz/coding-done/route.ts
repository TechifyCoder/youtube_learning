import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { codingCompletions } from '@/lib/db/schema'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { quizAttemptId, questionIndex } = await req.json()

    const [completion] = await db.insert(codingCompletions).values({
      userId: session.user.id,
      quizAttemptId,
      questionIndex
    }).returning()

    return NextResponse.json(completion)
  } catch (error: any) {
    console.error('[CODING_DONE]', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
