'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { formatDuration } from '@/lib/utils'
import { PlayCircle, CheckCircle2, Circle } from 'lucide-react'
import { GlassCard } from '@/components/common/GlassCard'
import { cn } from '@/lib/utils'
import type { Video } from '@/types'

// ─────────────────────────────────────────────────────────────
// VideoListItem Component
// Represents a single video in a playlist list
// ─────────────────────────────────────────────────────────────

interface VideoListItemProps {
  video: Video
  index: number
}

export function VideoListItem({ video, index }: VideoListItemProps) {
  // Phase 2: progress tracking is just static isCompleted boolean from DB
  const isComplete = video.isCompleted

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
    >
      <Link href={`/watch/${video.id}`}>
        <GlassCard 
          padding="sm" 
          variant={isComplete ? 'subtle' : 'standard'}
          className={cn(
            'flex items-center gap-4 group transition-all duration-200 relative overflow-hidden',
            isComplete && 'opacity-60 hover:opacity-100'
          )}
        >
          {/* Completion Icon */}
          <div className="shrink-0 pl-1 text-[--text-muted]">
            {isComplete ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <Circle className="w-5 h-5 group-hover:text-purple-400 transition-colors" />
            )}
          </div>

          {/* Thumbnail */}
          <div className="relative w-[100px] sm:w-[120px] aspect-video rounded-md overflow-hidden bg-white/[0.05] shrink-0">
            {video.thumbnail ? (
              <Image 
                src={video.thumbnail} 
                alt={video.title} 
                fill 
                sizes="120px" 
                className="object-cover" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <PlayCircle className="w-5 h-5 text-[--text-muted]" />
              </div>
            )}
            
            {/* Play overlay on hover */}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <PlayCircle className="w-8 h-8 text-white drop-shadow-md" />
            </div>

            {/* Duration badge */}
            <div className="absolute bottom-1.5 right-1.5 bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-medium text-white font-jetbrains">
              {formatDuration(video.durationSeconds)}
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 pr-2">
            <h4 className={cn(
              "text-sm sm:text-base font-medium line-clamp-2 transition-colors",
              isComplete ? 'text-[--text-secondary]' : 'text-[--text-primary] group-hover:text-purple-300'
            )}>
              <span className="text-[--text-muted] text-xs font-jetbrains mr-2">{index + 1}.</span>
              {video.title}
            </h4>
          </div>
        </GlassCard>
      </Link>
    </motion.div>
  )
}
