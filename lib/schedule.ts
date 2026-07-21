import type { Segment, Video, VideoPart, ScheduleDay } from '@/types'

// ─────────────────────────────────────────────────────────────
// lib/schedule.ts — Progress & Scheduling pure functions
// ─────────────────────────────────────────────────────────────

export function mergeSegments(segments: Segment[]): Segment[] {
  if (segments.length === 0) return []
  const sorted = [...segments].sort((a, b) => a.start - b.start)
  const merged: Segment[] = [sorted[0]!]
  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i]!
    const lastMerged = merged[merged.length - 1]!
    if (current.start <= lastMerged.end) {
      lastMerged.end = Math.max(lastMerged.end, current.end)
    } else {
      merged.push({ ...current })
    }
  }
  return merged
}

export function calculateWatchedSeconds(segments: Segment[]): number {
  return segments.reduce((total, seg) => total + (seg.end - seg.start), 0)
}

export function calculateProgress(segments: Segment[], durationSeconds: number): number {
  if (durationSeconds <= 0) return 0
  const totalWatched = calculateWatchedSeconds(segments)
  return Math.min(totalWatched / durationSeconds, 1)
}

export function isVideoComplete(segments: Segment[], durationSeconds: number): boolean {
  if (durationSeconds <= 0) return false
  const progress = calculateProgress(segments, durationSeconds)
  return progress >= 0.9 // 90% threshold
}

export function splitLongVideo(video: Video, targetSeconds: number): VideoPart[] {
  if (video.durationSeconds <= targetSeconds * 1.2) {
    return [
      {
        partNumber: 1,
        startSeconds: 0,
        endSeconds: video.durationSeconds,
        durationSeconds: video.durationSeconds,
      },
    ]
  }

  const partsCount = Math.ceil(video.durationSeconds / targetSeconds)
  const partDuration = Math.floor(video.durationSeconds / partsCount)
  
  const parts: VideoPart[] = []
  for (let i = 0; i < partsCount; i++) {
    const start = i * partDuration
    const end = i === partsCount - 1 ? video.durationSeconds : (i + 1) * partDuration
    parts.push({
      partNumber: i + 1,
      startSeconds: start,
      endSeconds: end,
      durationSeconds: end - start,
    })
  }

  return parts
}

// ─────────────────────────────────────────────────────────────
// Phase 4: Schedule Generation
// ─────────────────────────────────────────────────────────────

/**
 * Generates a schedule of days given a list of videos and target commitment days.
 */
export function generateSchedule(videos: Video[], commitmentDays: number, startDate: Date): Omit<ScheduleDay, 'id' | 'playlistId' | 'userId' | 'createdAt' | 'updatedAt'>[] {
  if (videos.length === 0 || commitmentDays <= 0) return []

  const totalDurationSeconds = videos.reduce((acc, v) => acc + v.durationSeconds, 0)
  const targetSecondsPerDay = totalDurationSeconds / commitmentDays

  // Flatten all videos into 'units' (videos or parts of long videos)
  const units: { videoId: string; title: string; duration: number }[] = []
  
  for (const video of videos) {
    // If a video is significantly longer than the daily target, split it
    if (video.durationSeconds > targetSecondsPerDay * 1.5) {
      const parts = splitLongVideo(video, targetSecondsPerDay)
      parts.forEach(part => {
        units.push({
          videoId: video.id,
          title: `${video.title} (Part ${part.partNumber})`,
          duration: part.durationSeconds
        })
      })
    } else {
      units.push({
        videoId: video.id,
        title: video.title,
        duration: video.durationSeconds
      })
    }
  }

  const schedule: Omit<ScheduleDay, 'id' | 'playlistId' | 'userId' | 'createdAt' | 'updatedAt'>[] = []
  
  let currentDayIndex = 0
  let currentDaySeconds = 0
  let currentDayVideoIds: string[] = []

  // Create date helper
  const getDateForDay = (offset: number) => {
    const d = new Date(startDate)
    d.setDate(d.getDate() + offset)
    return d.toISOString().split('T')[0]
  }

  for (let i = 0; i < units.length; i++) {
    const unit = units[i]!
    
    // Add to current day
    currentDayVideoIds.push(unit.videoId)
    currentDaySeconds += unit.duration

    // If day is full (or we are out of videos), finalize the day
    if (currentDaySeconds >= targetSecondsPerDay || i === units.length - 1) {
      schedule.push({
        dayNumber: currentDayIndex + 1,
        date: getDateForDay(currentDayIndex)!,
        videoIds: Array.from(new Set(currentDayVideoIds)), // unique video ids for this day
        targetMinutes: Math.round(currentDaySeconds / 60),
        isCompleted: false,
        status: 'upcoming'
      })
      
      // Reset for next day
      currentDayIndex++
      currentDaySeconds = 0
      currentDayVideoIds = []
    }
  }

  // Edge case: if we generated fewer days than commitment due to chunking/rounding,
  // we don't pad it. We just accept it finished slightly earlier.
  return schedule
}
