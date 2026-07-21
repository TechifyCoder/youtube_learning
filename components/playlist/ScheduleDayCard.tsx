'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { fadeInUp } from '@/lib/animations'
import { GlassCard } from '@/components/common/GlassCard'
import { CheckCircle2, Clock, Calendar, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-hot-toast'
import { cn, formatDate } from '@/lib/utils'
import { useScheduleStatus } from '@/hooks/useSchedule'
import type { ScheduleDay } from '@/types'

// ─────────────────────────────────────────────────────────────
// ScheduleDayCard Component
// Renders a single day in the schedule calendar
// ─────────────────────────────────────────────────────────────

interface ScheduleDayCardProps {
  day: ScheduleDay
  videoTitles: Record<string, string>
  onMarkComplete?: () => void
  index?: number
}

export function ScheduleDayCard({ day, videoTitles, onMarkComplete, index = 0 }: ScheduleDayCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  
  // Real status using the hook from Phase 4
  const status = useScheduleStatus(day)

  const handleComplete = async () => {
    setIsUpdating(true)
    try {
      const res = await fetch(`/api/schedule/${day.id}`, { method: 'PATCH' })
      if (!res.ok) throw new Error('Failed to update')
      toast.success(`Day ${day.dayNumber} completed!`)
      onMarkComplete?.()
    } catch (err) {
      toast.error('Could not update status')
    } finally {
      setIsUpdating(false)
    }
  }

  // Status visual mapping
  const statusConfig = {
    completed: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/[0.1]', label: 'Completed' },
    on_track:  { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/[0.1]', label: "Today's Target" },
    behind:    { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/[0.1]', label: 'Behind Schedule' },
    upcoming:  { icon: Calendar, color: 'text-[--text-muted]', bg: 'bg-white/[0.05]', label: 'Upcoming' },
  }

  const { icon: StatusIcon, color, bg, label } = statusConfig[status]

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="show"
      transition={{ delay: index * 0.1 }}
    >
      <GlassCard 
        padding="md" 
        variant={status === 'completed' ? 'subtle' : 'standard'}
        className={cn(
          "relative overflow-hidden transition-all duration-300",
          status === 'completed' && "opacity-60",
          status === 'on_track' && "border-blue-500/30",
          status === 'behind' && "border-red-500/30"
        )}
      >
        <div className="flex flex-col gap-4">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg bg-white/[0.05]", color)}>
                <StatusIcon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-heading font-medium text-[--text-primary]">
                  Day {day.dayNumber}
                </h4>
                <p className="text-xs text-[--text-secondary] mt-0.5">
                  {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
            
            <Badge variant="outline" className={cn("bg-white/[0.02]", color)}>
              {label}
            </Badge>
          </div>

          {/* Target */}
          <div className="flex items-center justify-between px-3 py-2 rounded bg-black/20 text-sm">
            <span className="text-[--text-secondary]">Daily Target</span>
            <span className="font-medium text-[--text-primary] flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-purple-400" />
              {day.targetMinutes} min
            </span>
          </div>

          {/* Videos to watch */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-[--text-muted] uppercase tracking-wider">
              Assigned Videos
            </p>
            <div className="space-y-1.5">
              {day.videoIds.map((id) => (
                <div key={id} className="flex items-start gap-2 text-sm">
                  <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-white/20 shrink-0" />
                  <span className="text-[--text-secondary] line-clamp-1 flex-1">
                    {videoTitles[id] || 'Unknown video'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action */}
          {!day.isCompleted && status !== 'upcoming' && (
            <div className="pt-2 mt-2 border-t border-white/[0.05]">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full bg-white/[0.02] hover:bg-green-500/10 hover:text-green-400 border-white/[0.05] hover:border-green-500/30"
                onClick={handleComplete}
                disabled={isUpdating}
              >
                {isUpdating ? 'Updating...' : 'Mark Day as Complete'}
                <CheckCircle2 className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

        </div>
      </GlassCard>
    </motion.div>
  )
}
