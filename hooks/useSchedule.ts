import { useState, useEffect } from 'react'
import type { ScheduleDay } from '@/types'

// ─────────────────────────────────────────────────────────────
// hooks/useSchedule.ts — Status calculation logic for Phase 4
// ─────────────────────────────────────────────────────────────

/**
 * Calculates the dynamic status of a schedule day based on current date
 */
export function getScheduleDayStatus(day: ScheduleDay): 'completed' | 'on_track' | 'behind' | 'upcoming' {
  if (day.isCompleted) return 'completed'

  const todayStr = new Date().toISOString().split('T')[0]!
  // Ensure date is string format "YYYY-MM-DD"
  const dayStr = new Date(day.date).toISOString().split('T')[0]!

  if (dayStr < todayStr) return 'behind'
  if (dayStr === todayStr) return 'on_track'
  return 'upcoming'
}

export function useScheduleStatus(day: ScheduleDay) {
  const [status, setStatus] = useState(day.status)

  // Re-calculate client side to ensure timezone correctness on hydration
  useEffect(() => {
    setStatus(getScheduleDayStatus(day))
  }, [day])

  return status
}
