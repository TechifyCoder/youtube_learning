import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { users, activityLog } from '@/lib/db/schema'
import { eq, desc, and, gte } from 'drizzle-orm'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { ActivityHeatmap } from '@/components/dashboard/ActivityHeatmap'
import { GlassCard } from '@/components/common/GlassCard'
import { Flame, Clock, CalendarDays, Award } from 'lucide-react'
import { format, subDays, startOfMonth, parseISO, endOfMonth } from 'date-fns'

// A client component to render the chart
import { MonthlyActivityChart } from './MonthlyActivityChart'

export const metadata = {
  title: 'Activity - LearnLoop',
}

export default async function ActivityPage() {
  const session = await auth()
  if (!session?.user?.id) return redirect('/login')

  // Fetch user stats
  const [user] = await db
    .select({
      streakCount: users.streakCount,
      longestStreak: users.longestStreak,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, session.user.id))

  if (!user) return redirect('/login')

  // Fetch last 364 days of activity
  const oneYearAgo = subDays(new Date(), 364)
  const logs = await db
    .select()
    .from(activityLog)
    .where(
      and(
        eq(activityLog.userId, session.user.id),
        gte(activityLog.date, format(oneYearAgo, 'yyyy-MM-dd'))
      )
    )

  // Calculate stats
  const totalMinutes = logs.reduce((sum, log) => sum + log.minutesWatched, 0)
  const totalHours = Math.round(totalMinutes / 60)
  
  const daysActive = logs.length
  const averagePerDay = daysActive > 0 ? Math.round(totalMinutes / daysActive) : 0

  // Group by month for the chart
  const monthlyData: Record<string, number> = {}
  logs.forEach(log => {
    const monthKey = format(parseISO(log.date), 'MMM yyyy')
    monthlyData[monthKey] = (monthlyData[monthKey] || 0) + log.minutesWatched
  })

  // Format chart data (last 6 months)
  const chartData = []
  for (let i = 5; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const monthKey = format(date, 'MMM yyyy')
    chartData.push({
      name: format(date, 'MMM'),
      hours: Math.round((monthlyData[monthKey] || 0) / 60)
    })
  }

  return (
    <PageWrapper className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="font-heading font-bold text-3xl text-[--text-primary] mb-2">
          Your Activity
        </h1>
        <p className="text-[--text-secondary]">
          Track your learning consistency and watch time.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard padding="md">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-[--text-secondary]">Total Time</p>
          </div>
          <p className="text-2xl font-bold text-[--text-primary]">{totalHours}h</p>
          <p className="text-xs text-[--text-muted] mt-1">this year</p>
        </GlassCard>

        <GlassCard padding="md">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400">
              <Flame className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-[--text-secondary]">Current Streak</p>
          </div>
          <p className="text-2xl font-bold text-[--text-primary]">{user?.streakCount ?? 0}</p>
          <p className="text-xs text-[--text-muted] mt-1">days</p>
        </GlassCard>

        <GlassCard padding="md">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <Award className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-[--text-secondary]">Best Streak</p>
          </div>
          <p className="text-2xl font-bold text-[--text-primary]">{user?.longestStreak ?? 0}</p>
          <p className="text-xs text-[--text-muted] mt-1">days</p>
        </GlassCard>

        <GlassCard padding="md">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
              <CalendarDays className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-[--text-secondary]">Daily Avg</p>
          </div>
          <p className="text-2xl font-bold text-[--text-primary]">{averagePerDay}m</p>
          <p className="text-xs text-[--text-muted] mt-1">on active days</p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <GlassCard padding="lg" className="overflow-hidden">
            <h2 className="text-sm font-semibold mb-6 uppercase tracking-wider text-[--text-muted]">Learning Heatmap</h2>
            <div className="-mx-4 md:mx-0 overflow-x-auto pb-4">
              <div className="min-w-[800px] px-4 md:px-0">
                <ActivityHeatmap />
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="lg:col-span-1">
          <GlassCard padding="lg" className="h-full">
            <h2 className="text-sm font-semibold mb-6 uppercase tracking-wider text-[--text-muted]">Monthly Hours</h2>
            <MonthlyActivityChart data={chartData} />
          </GlassCard>
        </div>
      </div>
    </PageWrapper>
  )
}
