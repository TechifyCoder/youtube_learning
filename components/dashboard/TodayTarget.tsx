'use client'

import { GlassCard } from '@/components/common/GlassCard'
import { PlayCircle, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import type { ScheduleDay, Video } from '@/types'

// ─────────────────────────────────────────────────────────────
// TodayTarget Component
// Shows the goal for the current day on the dashboard
// ─────────────────────────────────────────────────────────────

interface TodayTargetProps {
  todaySchedule?: ScheduleDay
  videos?: Video[] // For the specific playlist the schedule belongs to
  playlistId?: string
}

export function TodayTarget({ todaySchedule, videos, playlistId }: TodayTargetProps) {
  const router = useRouter()

  if (!todaySchedule || !videos || !playlistId) {
    return (
      <GlassCard padding="lg" variant="subtle" className="h-full flex flex-col justify-center items-center text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-white/[0.05] flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6 text-[--text-muted]" />
        </div>
        <div>
          <h3 className="font-heading font-medium text-lg text-[--text-primary]">
            You're all caught up!
          </h3>
          <p className="text-sm text-[--text-secondary] mt-1">
            No videos scheduled for today. Take a break or start a new course.
          </p>
        </div>
      </GlassCard>
    )
  }

  const { targetMinutes, isCompleted, videoIds } = todaySchedule
  
  // Find titles for the first 2 videos
  const titles = videoIds.slice(0, 2).map(id => videos.find(v => v.id === id)?.title).filter(Boolean)
  const hasMore = videoIds.length > 2

  if (isCompleted) {
    return (
      <GlassCard padding="lg" variant="elevated" className="h-full border-green-500/20 bg-green-500/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-[50px] -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-col h-full justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-green-400 mb-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Goal Reached</span>
            </div>
            <h3 className="font-heading font-bold text-2xl text-[--text-primary]">
              Great job today!
            </h3>
            <p className="text-sm text-[--text-secondary] mt-1">
              You completed your {targetMinutes} min daily target.
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => router.push(`/playlist/${playlistId}`)}
            className="w-full bg-white/[0.02]"
          >
            View Schedule
          </Button>
        </div>
      </GlassCard>
    )
  }

  // Determine if behind (if todaySchedule date is strictly < today, but this component is supposed to show *today's* target or the first uncompleted one)
  // Let's assume todaySchedule passed is the earliest uncompleted day.
  const todayStr = new Date().toISOString().split('T')[0]
  const isBehind = todaySchedule.date < todayStr!

  return (
    <GlassCard padding="lg" variant="elevated" className={`h-full relative overflow-hidden ${isBehind ? 'border-red-500/20 bg-red-500/5' : 'border-blue-500/20 bg-blue-500/5'}`}>
      <div className={`absolute top-0 right-0 w-32 h-32 blur-[50px] -translate-y-1/2 translate-x-1/2 ${isBehind ? 'bg-red-500/10' : 'bg-blue-500/10'}`} />
      
      <div className="relative z-10 flex flex-col h-full justify-between gap-4">
        <div>
          <div className={`flex items-center gap-2 mb-2 ${isBehind ? 'text-red-400' : 'text-blue-400'}`}>
            {isBehind ? <AlertCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
            <span className="font-medium">
              {isBehind ? "You're behind!" : "Today's Goal"}
            </span>
          </div>
          <h3 className="font-heading font-bold text-2xl text-[--text-primary]">
            Watch {targetMinutes} min
          </h3>
          <p className="text-sm text-[--text-secondary] mt-2 line-clamp-2">
            Up next: {titles.join(', ')} {hasMore && `+${videoIds.length - 2} more`}
          </p>
        </div>
        
        <Button 
          onClick={() => router.push(`/watch/${videoIds[0]}`)}
          className={`w-full text-white border-white/[0.1] ${isBehind ? 'bg-red-500/20 hover:bg-red-500/30' : 'bg-blue-500/20 hover:bg-blue-500/30'}`}
        >
          {isBehind ? 'Catch Up Now' : 'Start Watching'}
          <PlayCircle className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </GlassCard>
  )
}
