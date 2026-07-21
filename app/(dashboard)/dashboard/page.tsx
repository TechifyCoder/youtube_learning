import { PlusCircle } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { CourseCard } from '@/components/dashboard/CourseCard'
import { StatsRow } from '@/components/dashboard/StatsRow'
import { TodayTarget } from '@/components/dashboard/TodayTarget'
import { StreakCard } from '@/components/dashboard/StreakCard'
import { ActivityHeatmap } from '@/components/dashboard/ActivityHeatmap'
import { TimeTrackerCard } from '@/components/dashboard/TimeTrackerCard'
import { DashboardStagger, DashboardStaggerItem } from '@/components/dashboard/DashboardStagger'
import { db } from '@/lib/db'
import { playlists, videos as videosTable, scheduleDays } from '@/lib/db/schema'
import { eq, desc, asc, and, inArray } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { getScheduleDayStatus } from '@/lib/scheduleClient' // wait, I need a server-safe one
import type { CourseCardData, StatsData } from '@/types'

// ... (will write a local helper here)

export const metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) return null

  const userPlaylists = await db
    .select()
    .from(playlists)
    .where(eq(playlists.userId, userId))
    .orderBy(desc(playlists.createdAt))

  const allVideos = await db
    .select()
    .from(videosTable)
    .where(eq(videosTable.userId, userId))

  const playlistIds = userPlaylists.map(p => p.id)
  
  const allScheduleDays = playlistIds.length > 0
    ? await db
        .select()
        .from(scheduleDays)
        .where(inArray(scheduleDays.playlistId, playlistIds))
        .orderBy(asc(scheduleDays.date))
    : []

  const todayStr = new Date().toISOString().split('T')[0]!

  let globalNextDay = null
  let globalNextDayPlaylistId = null

  const courseCards: CourseCardData[] = userPlaylists.map((p) => {
    const pVideos = allVideos.filter(v => v.playlistId === p.id)
    const pSchedule = allScheduleDays.filter(s => s.playlistId === p.id)
    const completed = pVideos.filter(v => v.isCompleted).length
    const totalDurationSeconds = pVideos.reduce((acc, v) => acc + v.durationSeconds, 0)
    
    // Total watched is calculated via progress or completed videos
    const totalWatchedSeconds = pVideos.filter(v => v.isCompleted).reduce((acc, v) => acc + v.durationSeconds, 0)

    // Find next uncompleted day
    const uncompletedDays = pSchedule.filter(s => !s.isCompleted)
    const nextDay = uncompletedDays[0] || null

    if (nextDay) {
      if (!globalNextDay || nextDay.date < globalNextDay.date) {
        globalNextDay = nextDay
        globalNextDayPlaylistId = p.id
      }
    }

    let scheduleStatus: 'completed' | 'on_track' | 'behind' | 'upcoming' = 'upcoming'
    if (pSchedule.length > 0 && uncompletedDays.length === 0) {
      scheduleStatus = 'completed'
    } else if (nextDay) {
      if (nextDay.date < todayStr) scheduleStatus = 'behind'
      else if (nextDay.date === todayStr) scheduleStatus = 'on_track'
    }

    return {
      playlist: p,
      completedVideos: completed,
      totalVideos: pVideos.length,
      totalWatchedSeconds,
      totalDurationSeconds,
      scheduleStatus,
      currentDay: nextDay ? nextDay.dayNumber : null,
      totalDays: pSchedule.length,
      targetMinutes: nextDay ? nextDay.targetMinutes : null,
    }
  })

  const totalHoursWatched = Math.round(
    courseCards.reduce((acc, card) => acc + card.totalWatchedSeconds, 0) / 3600
  )
  const completedCoursesCount = courseCards.filter(
    (c) => c.completedVideos === c.totalVideos && c.totalVideos > 0
  ).length
  const activeCoursesCount = courseCards.length - completedCoursesCount

  const stats: StatsData = {
    totalHoursWatched,
    activeCoursesCount,
    completedCoursesCount,
  }

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      <div>
        <h1 className="font-heading font-bold text-display text-[--text-primary] mb-1">
          Dashboard
        </h1>
        <p className="text-body text-[--text-secondary]">
          Welcome back! Here's what's happening with your courses.
        </p>
      </div>

      {userPlaylists.length > 0 ? (
        <DashboardStagger>
          {/* Top Row: Stats (Bento Top) */}
          <DashboardStaggerItem>
            <StatsRow stats={stats} />
          </DashboardStaggerItem>

          {/* Middle Row: Bento Split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <DashboardStaggerItem className="col-span-1 lg:col-span-2">
              <div className="h-full bg-[--bg-card] rounded-3xl border border-[--border-subtle] p-6 shadow-card">
                <h3 className="text-label text-[--text-muted] uppercase tracking-wider mb-4">Activity Heatmap</h3>
                <ActivityHeatmap />
              </div>
            </DashboardStaggerItem>
            <DashboardStaggerItem className="col-span-1 lg:col-span-1">
              <TodayTarget 
                todaySchedule={globalNextDay as any} 
                videos={allVideos as any[]} 
                playlistId={globalNextDayPlaylistId as any} 
              />
            </DashboardStaggerItem>
          </div>

          {/* Bottom Row: Bento Bottom (Streak + Time Tracker) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <DashboardStaggerItem className="col-span-1 lg:col-span-1">
              <StreakCard />
            </DashboardStaggerItem>
            <DashboardStaggerItem className="col-span-1 lg:col-span-2">
              <TimeTrackerCard />
            </DashboardStaggerItem>
          </div>

          {/* My Courses Section */}
          <DashboardStaggerItem className="pt-4 border-t border-[--border-subtle]">
            <h2 className="font-heading font-semibold text-xl text-[--text-primary] mb-4">
              My Courses
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courseCards.map((card, idx) => (
                <CourseCard key={card.playlist.id} data={card} index={idx} />
              ))}
            </div>
          </DashboardStaggerItem>
        </DashboardStagger>
      ) : (
        <EmptyState
          icon={<PlusCircle className="w-7 h-7" />}
          title="No courses yet"
          description="Import a YouTube playlist or build a custom course to get started with your learning journey."
          action={{
            label: 'Import your first course →',
            href:  '/import',
          }}
          className="mt-12"
        />
      )}
    </div>
  )
}
