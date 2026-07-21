'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { slideDown } from '@/lib/animations'
import { formatDuration } from '@/lib/utils'
import { PlayCircle, Clock } from 'lucide-react'
import type { YouTubePlaylistData } from '@/types'
import { GlassCard } from '@/components/common/GlassCard'
import { Badge } from '@/components/common/Badge'

// ─────────────────────────────────────────────────────────────
// PlaylistPreview Component
// Displays fetched playlist metadata before saving
// ─────────────────────────────────────────────────────────────

interface PlaylistPreviewProps {
  data: YouTubePlaylistData
}

export function PlaylistPreview({ data }: PlaylistPreviewProps) {
  return (
    <motion.div
      variants={slideDown}
      initial="hidden"
      animate="show"
      exit="hidden"
    >
      <GlassCard padding="md" variant="elevated" className="flex flex-col sm:flex-row gap-5 items-start">
        {/* Thumbnail */}
        <div className="relative w-full sm:w-48 aspect-video rounded-xl overflow-hidden shrink-0 bg-white/[0.05] border border-white/[0.10]">
          {data.thumbnail ? (
            <Image
              src={data.thumbnail}
              alt={data.title}
              fill
              sizes="(max-width: 640px) 100vw, 192px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PlayCircle className="w-8 h-8 text-[--text-muted]" />
            </div>
          )}
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-heading font-semibold text-lg text-[--text-primary] leading-tight line-clamp-2">
              {data.title}
            </h3>
            {data.playlistId ? (
               <Badge variant="youtube" className="shrink-0" />
            ) : (
               <Badge variant="custom" className="shrink-0" />
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-[--text-secondary]">
            <div className="flex items-center gap-1.5">
              <PlayCircle className="w-4 h-4 text-purple-400" />
              <span>{data.videoCount} {data.videoCount === 1 ? 'video' : 'videos'}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-white/[0.20]" />
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>{formatDuration(data.totalDurationSeconds)}</span>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}
