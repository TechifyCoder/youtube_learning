import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { quizAttempts } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { videoId, playlistId, quizType, questions, maxScore } = body

    if (quizType === 'video' && videoId) {
      await db.delete(quizAttempts).where(
        and(
          eq(quizAttempts.userId, session.user.id),
          eq(quizAttempts.videoId, videoId)
        )
      )
    } else if (quizType === 'final') {
      await db.delete(quizAttempts).where(
        and(
          eq(quizAttempts.userId, session.user.id),
          eq(quizAttempts.playlistId, playlistId),
          eq(quizAttempts.quizType, 'final')
        )
      )
    }

    const [attempt] = await db.insert(quizAttempts).values({
      userId: session.user.id,
      videoId: videoId || null,
      playlistId,
      quizType,
      questions,
      maxScore: maxScore || 100,
      answers: [],
      score: 0,
      isComplete: false,
    }).returning()

    return NextResponse.json(attempt)
  } catch (error: any) {
    console.error('[QUIZ_ATTEMPT]', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
