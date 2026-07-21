'use client'

import { formatDuration } from '@/lib/utils'
import { PlayCircle } from 'lucide-react'
import type { VideoPart } from '@/types'

// ─────────────────────────────────────────────────────────────
// VideoParts Component
// Lists the split parts of a long video
// ─────────────────────────────────────────────────────────────

interface VideoPartsProps {
  parts: VideoPart[]
  onSeek: (seconds: number) => void
}

export function VideoParts({ parts, onSeek }: VideoPartsProps) {
  if (!parts || parts.length <= 1) return null

  return (
    <div className="space-y-3 mt-8">
      <h3 className="font-heading font-medium text-lg text-[--text-primary]">
        Video Parts
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {parts.map((part) => (
          <button
            key={part.partNumber}
            onClick={() => onSeek(part.startSeconds)}
            className="flex flex-col gap-1 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.08] hover:border-purple-500/30 transition-all text-left group"
          >
            <div className="flex justify-between items-center w-full">
              <span className="font-medium text-[--text-primary] group-hover:text-purple-300 transition-colors">
                Part {part.partNumber}
              </span>
              <PlayCircle className="w-4 h-4 text-[--text-muted] group-hover:text-purple-400" />
            </div>
            <span className="text-xs text-[--text-secondary] font-jetbrains">
              {formatDuration(part.startSeconds)} – {formatDuration(part.endSeconds)}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
