'use client'

import { useState } from 'react'
import { ScheduleDayCard } from './ScheduleDayCard'
import type { ScheduleDay, Video } from '@/types'

// ─────────────────────────────────────────────────────────────
// ScheduleCalendar Component
// Renders the list of days for a playlist
// ─────────────────────────────────────────────────────────────

interface ScheduleCalendarProps {
  schedule: ScheduleDay[]
  videos: Video[]
}

export function ScheduleCalendar({ schedule, videos }: ScheduleCalendarProps) {
  const [localSchedule, setLocalSchedule] = useState(schedule)

  // Map of videoId -> title for quick lookup in cards
  const videoTitles = videos.reduce((acc, v) => {
    acc[v.id] = v.title
    return acc
  }, {} as Record<string, string>)

  const handleMarkComplete = (index: number) => {
    const updated = [...localSchedule]
    if (updated[index]) {
      updated[index].isCompleted = true
      updated[index].status = 'completed'
      setLocalSchedule(updated)
    }
  }

  if (!schedule || schedule.length === 0) {
    return (
      <div className="text-center py-8 text-[--text-muted] bg-white/[0.02] rounded-xl border border-white/[0.05]">
        No schedule generated for this course.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {localSchedule.map((day, index) => (
        <ScheduleDayCard 
          key={day.id} 
          day={day} 
          videoTitles={videoTitles}
          onMarkComplete={() => handleMarkComplete(index)}
          index={index}
        />
      ))}
    </div>
  )
}
