import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { quizAttempts } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const videoId = searchParams.get('videoId')
    const playlistId = searchParams.get('playlistId')

    let conditions = [eq(quizAttempts.userId, session.user.id)]

    if (videoId) {
      conditions.push(eq(quizAttempts.videoId, videoId))
    }
    if (playlistId) {
      conditions.push(eq(quizAttempts.playlistId, playlistId))
    }

    const history = await db.query.quizAttempts.findMany({
      where: and(...conditions),
      orderBy: (quizAttempts, { desc }) => [desc(quizAttempts.startedAt)]
    })

    return NextResponse.json(history)
  } catch (error: any) {
    console.error('[QUIZ_HISTORY]', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
