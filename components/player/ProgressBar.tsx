'use client'

import { useState, useRef } from 'react'
import type { Segment } from '@/types'

// ─────────────────────────────────────────────────────────────
// ProgressBar Component
// Renders watched segments as green slices on a red track
// ─────────────────────────────────────────────────────────────

interface ProgressBarProps {
  segments: Segment[]
  durationSeconds: number
}

export function ProgressBar({ segments, durationSeconds }: ProgressBarProps) {
  const [hoverPos, setHoverPos] = useState<number | null>(null)
  const [tooltipX, setTooltipX] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!trackRef.current || durationSeconds <= 0) return
    const rect = trackRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = Math.max(0, Math.min(x / rect.width, 1))
    
    setTooltipX(e.clientX)
    setHoverPos(percentage * durationSeconds)
  }

  const handleMouseLeave = () => {
    setHoverPos(null)
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  // Calculate total watched minutes for legend
  const watchedSeconds = segments.reduce((acc, seg) => acc + (seg.end - seg.start), 0)
  const remainingSeconds = Math.max(0, durationSeconds - watchedSeconds)

  return (
    <div className="space-y-3">
      {/* Track */}
      <div 
        ref={trackRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative h-4 w-full bg-red-950/40 rounded-full overflow-hidden border border-white/[0.05] cursor-crosshair group"
      >
        {/* Unwatched background (red) */}
        <div className="absolute inset-0 bg-red-500/20" />

        {/* Watched segments (green) */}
        {durationSeconds > 0 && segments.map((seg, i) => {
          const left = (seg.start / durationSeconds) * 100
          const width = ((seg.end - seg.start) / durationSeconds) * 100
          return (
            <div
              key={i}
              className="absolute top-0 bottom-0 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] transition-all duration-300"
              style={{ left: `${left}%`, width: `${width}%` }}
            />
          )
        })}

        {/* Hover marker */}
        {hoverPos !== null && (
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] pointer-events-none z-10"
            style={{ left: `${(hoverPos / durationSeconds) * 100}%` }}
          />
        )}
      </div>

      {/* Hover Tooltip (Portal-like floating text) */}
      {hoverPos !== null && (
        <div 
          className="fixed z-50 px-2 py-1 bg-black/80 backdrop-blur-md rounded text-xs font-jetbrains text-white pointer-events-none -translate-x-1/2 -translate-y-8"
          style={{ left: tooltipX, top: trackRef.current?.getBoundingClientRect().top }}
        >
          {formatTime(hoverPos)}
        </div>
      )}

      {/* Legend */}
      <div className="flex justify-between items-center text-xs font-medium px-1">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-green-400">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
            Watched {Math.round(watchedSeconds / 60)} min
          </div>
          <div className="flex items-center gap-1.5 text-red-400">
            <div className="w-2 h-2 rounded-full bg-red-500/50" />
            Remaining {Math.round(remainingSeconds / 60)} min
          </div>
        </div>
        <div className="text-[--text-muted] font-jetbrains">
          Total: {formatTime(durationSeconds)}
        </div>
      </div>
    </div>
  )
}
