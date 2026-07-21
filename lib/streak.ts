import { db } from '@/lib/db'
import { users, activityLog } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { addDays, differenceInCalendarDays, startOfDay } from 'date-fns'

// Format date to YYYY-MM-DD for database
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function isStreakAlive(lastActiveDateStr: string | null): boolean {
  if (!lastActiveDateStr) return false
  
  const today = startOfDay(new Date())
  const lastActive = startOfDay(new Date(lastActiveDateStr))
  
  const diffDays = differenceInCalendarDays(today, lastActive)
  
  // Streak is alive if active today or yesterday
  return diffDays <= 1
}

export function calculateStreak(lastActiveDateStr: string | null, currentStreak: number): number {
  if (!lastActiveDateStr) return 1

  const today = startOfDay(new Date())
  const lastActive = startOfDay(new Date(lastActiveDateStr))
  
  const diffDays = differenceInCalendarDays(today, lastActive)

  if (diffDays === 0) {
    // Already active today
    return currentStreak
  } else if (diffDays === 1) {
    // Active yesterday, streak continues
    return currentStreak + 1
  } else {
    // Gap of more than 1 day, streak resets
    return 1
  }
}

export async function updateStreak(userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  
  if (!user) throw new Error('User not found')

  const todayStr = formatDate(new Date())
  
  // If already active today, no need to update streak count, but we might want to return current stats
  if (user.lastActiveDate === todayStr) {
    return {
      currentStreak: user.streakCount,
      longestStreak: user.longestStreak,
      isNewRecord: false,
    }
  }

  const newStreak = calculateStreak(user.lastActiveDate, user.streakCount)
  const newLongestStreak = Math.max(newStreak, user.longestStreak)
  const isNewRecord = newStreak > user.longestStreak

  await db
    .update(users)
    .set({
      streakCount: newStreak,
      longestStreak: newLongestStreak,
      lastActiveDate: todayStr,
    })
    .where(eq(users.id, userId))

  return {
    currentStreak: newStreak,
    longestStreak: newLongestStreak,
    isNewRecord,
  }
}

export async function upsertActivityLog(userId: string, minutesWatched: number, newVideoWatched: boolean) {
  const todayStr = formatDate(new Date())
  
  const [existingLog] = await db
    .select()
    .from(activityLog)
    .where(and(eq(activityLog.userId, userId), eq(activityLog.date, todayStr)))
    .limit(1)

  if (existingLog) {
    await db
      .update(activityLog)
      .set({
        minutesWatched: existingLog.minutesWatched + minutesWatched,
        videosWatched: existingLog.videosWatched + (newVideoWatched ? 1 : 0),
      })
      .where(eq(activityLog.id, existingLog.id))
  } else {
    await db
      .insert(activityLog)
      .values({
        userId,
        date: todayStr,
        minutesWatched,
        videosWatched: newVideoWatched ? 1 : 0,
      })
  }
}
