'use client'

import { motion } from 'framer-motion'
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer'

// ─────────────────────────────────────────────────────────────
// YouTubePlayer Component
// UI wrapper around the IFrame hook with glassmorphism styling
// ─────────────────────────────────────────────────────────────

interface YouTubePlayerProps {
  videoId: string
  startSeconds?: number
  onReady?: (controls: { seekTo: (time: number) => void, play: () => void, pause: () => void, getCurrentTime: () => number }) => void
  onStateChange?: (state: number) => void
  onPlay?: (time: number) => void
  onPause?: (time: number) => void
  onEnded?: (time: number) => void
  onTimeUpdate?: (time: number) => void
}

import { Maximize, Minimize } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export function YouTubePlayer({
  videoId,
  startSeconds = 0,
  onReady,
  onStateChange,
  onPlay,
  onPause,
  onEnded,
  onTimeUpdate,
}: YouTubePlayerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const { containerRef, isReady, seekTo, play, pause, getCurrentTime } = useYouTubePlayer({
    videoId,
    startSeconds,
    onReady: () => onReady?.({ seekTo, play, pause, getCurrentTime }),
    onStateChange,
    onPlay,
    onPause,
    onEnded,
    onTimeUpdate,
  })

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      wrapperRef.current?.requestFullscreen?.().catch(console.error)
    } else {
      document.exitFullscreen?.()
    }
  }

  return (
    <motion.div
      ref={wrapperRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative w-full aspect-video rounded-2xl overflow-hidden bg-black/[0.5] shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/[0.1] backdrop-blur-xl"
    >
      {/* Loading state skeleton */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/[0.02] z-10">
          <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
        </div>
      )}

      {/* The actual YouTube iframe will mount here */}
      <div className="w-full h-full pointer-events-auto" style={{ opacity: isReady ? 1 : 0, transition: 'opacity 0.5s' }}>
        <div ref={containerRef} />
      </div>
      
      {/* Custom Controls Overlay */}
      {isReady && (
        <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button 
            onClick={toggleFullScreen}
            className="p-2 rounded-lg bg-black/60 backdrop-blur-md border border-white/[0.1] text-white hover:bg-white/[0.1] transition-colors"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      )}
    </motion.div>
  )
}
