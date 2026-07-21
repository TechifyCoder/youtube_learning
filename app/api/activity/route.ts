import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { activityLog } from '@/lib/db/schema'
import { eq, and, gte, desc } from 'drizzle-orm'
import { subDays } from 'date-fns'
import { formatDate } from '@/lib/streak'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const daysParam = searchParams.get('days')
    const days = daysParam ? parseInt(daysParam, 10) : 365
    
    // Calculate the start date
    const startDate = new Date()
    const fromDate = subDays(startDate, days)
    const fromDateStr = formatDate(fromDate)

    const logs = await db
      .select({
        date: activityLog.date,
        minutesWatched: activityLog.minutesWatched,
        videosWatched: activityLog.videosWatched,
      })
      .from(activityLog)
      .where(
        and(
          eq(activityLog.userId, session.user.id),
          gte(activityLog.date, fromDateStr)
        )
      )
      .orderBy(desc(activityLog.date))

    return Response.json(logs)
  } catch (error) {
    console.error('[GET /api/activity]', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
