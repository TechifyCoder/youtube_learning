import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { users, activityLog } from '@/lib/db/schema'
import { eq, and, gte, lte } from 'drizzle-orm'
import { isStreakAlive, formatDate } from '@/lib/streak'

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

    const today = new Date()
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(today.getDate() - 6)
    
    const startDateStr = formatDate(sevenDaysAgo)
    const endDateStr = formatDate(today)

    const logs = await db
      .select({ date: activityLog.date })
      .from(activityLog)
      .where(
        and(
          eq(activityLog.userId, session.user.id),
          gte(activityLog.date, startDateStr),
          lte(activityLog.date, endDateStr)
        )
      )

    const activeDates = logs.map(l => l.date)

    return Response.json({
      currentStreak: alive ? user.streakCount : 0,
      longestStreak: user.longestStreak,
      isAlive: alive,
      activeDates,
    })
  } catch (error) {
    console.error('[GET /api/streak]', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
