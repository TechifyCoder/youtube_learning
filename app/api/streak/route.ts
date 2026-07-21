import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { isStreakAlive } from '@/lib/streak'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [user] = await db
      .select({
        streakCount: users.streakCount,
        longestStreak: users.longestStreak,
        lastActiveDate: users.lastActiveDate,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1)

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    const alive = isStreakAlive(user.lastActiveDate)
    
    return Response.json({
      currentStreak: alive ? user.streakCount : 0,
      longestStreak: user.longestStreak,
      isAlive: alive,
    })
  } catch (error) {
    console.error('[GET /api/streak]', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
