import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { quizAttempts } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { answers, score, isComplete } = body

    const updateData: any = {}
    if (answers !== undefined) updateData.answers = answers
    if (score !== undefined) updateData.score = score
    if (isComplete !== undefined) {
      updateData.isComplete = isComplete
      if (isComplete) updateData.completedAt = new Date()
    }

    const [updated] = await db.update(quizAttempts)
      .set(updateData)
      .where(
        and(
          eq(quizAttempts.id, params.id),
          eq(quizAttempts.userId, session.user.id)
        )
      ).returning()

    if (!updated) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('[QUIZ_ATTEMPT_UPDATE]', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
