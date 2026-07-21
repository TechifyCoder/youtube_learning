'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { fadeInUp } from '@/lib/animations'
import { GlassCard } from '@/components/common/GlassCard'
import { Badge as UiBadge } from '@/components/common/Badge'
import { PlayCircle, Clock, Calendar, CheckCircle2, AlertCircle } from 'lucide-react'
import { formatDuration, formatDate, cn } from '@/lib/utils'
import type { CourseCardData } from '@/types'

// ─────────────────────────────────────────────────────────────
// CourseCard Component
// Shows a playlist summary on the dashboard
// ─────────────────────────────────────────────────────────────

interface CourseCardProps {
  data: CourseCardData
  index?: number
}

export function CourseCard({ data, index = 0 }: CourseCardProps) {
  const { playlist, completedVideos, totalVideos, totalDurationSeconds, scheduleStatus, currentDay, totalDays, targetMinutes } = data
  const progressPercent = Math.round((completedVideos / (totalVideos || 1)) * 100)

  const statusConfig = {
    completed: { icon: CheckCircle2, color: 'text-green-400', label: 'Completed' },
    on_track:  { icon: PlayCircle, color: 'text-blue-400', label: 'On Track' },
    behind:    { icon: AlertCircle, color: 'text-red-400', label: 'Behind' },
    upcoming:  { icon: Calendar, color: 'text-[--text-muted]', label: 'Upcoming' },
  }

  const { icon: StatusIcon, color, label } = statusConfig[scheduleStatus] || statusConfig.upcoming

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="show"
      transition={{ delay: index * 0.1 }}
      className="h-full block"
    >
      <Link href={`/playlist/${playlist.id}`} className="group block h-full">
      <GlassCard 
        padding="none" 
        variant="standard" 
        className={cn(
          "flex flex-col sm:flex-row h-full overflow-hidden hover:-translate-y-1 transition-all duration-300",
          scheduleStatus === 'completed' && "opacity-80"
        )}
      >
        {/* Thumbnail area */}
        <div className="relative w-full sm:w-48 lg:w-56 aspect-video sm:aspect-auto shrink-0 bg-white/[0.03]">
          {playlist.thumbnail ? (
            <Image 
              src={playlist.thumbnail} 
              alt={playlist.title} 
              fill 
              sizes="(max-width: 640px) 100vw, 224px"
              className="object-cover transition-transform duration-500 group-hover:scale-105" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PlayCircle className="w-8 h-8 text-[--text-muted]" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
          
          <UiBadge 
            variant={playlist.source as any} 
            className="absolute top-3 left-3 bg-black/60 backdrop-blur-md" 
          />
        </div>

        {/* Content area */}
        <div className="flex-1 p-5 flex flex-col justify-between gap-4">
          
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <h3 className="font-heading font-semibold text-lg text-[--text-primary] line-clamp-2 group-hover:text-purple-300 transition-colors">
                {playlist.title}
              </h3>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[--text-secondary]">
              {totalDays && currentDay ? (
                <div className="flex items-center gap-1.5 text-[--text-primary] font-medium bg-white/[0.05] px-2 py-0.5 rounded">
                  <Calendar className="w-3.5 h-3.5 text-purple-400" />
                  <span>Day {currentDay} of {totalDays}</span>
                </div>
              ) : null}

              {targetMinutes ? (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>{targetMinutes} min / day</span>
                </div>
              ) : null}

              <div className="flex items-center gap-1.5">
                <PlayCircle className="w-3.5 h-3.5 text-green-400" />
                <span>{completedVideos}/{totalVideos} vids</span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5 mt-2">
            <div className="flex justify-between items-end text-xs font-medium">
              <div className={cn("flex items-center gap-1", color)}>
                <StatusIcon className="w-3 h-3" />
                <span>{label}</span>
              </div>
              <span className="text-purple-400">{progressPercent}%</span>
            </div>
            <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden border border-white/[0.05]">
              <div 
                className="h-full bg-gradient-to-r from-purple-600 to-violet-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          
        </div>
      </GlassCard>
      </Link>
    </motion.div>
  )
}
