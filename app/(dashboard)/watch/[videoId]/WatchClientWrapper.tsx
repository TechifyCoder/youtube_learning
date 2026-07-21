'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWatchProgress } from '@/hooks/useWatchProgress'
import { YouTubePlayer } from '@/components/player/YouTubePlayer'
import { ProgressBar } from '@/components/player/ProgressBar'
import { VideoParts } from '@/components/player/VideoParts'
import { TranscriptChat } from '@/components/player/TranscriptChat'
import { TimestampNotes } from '@/components/player/TimestampNotes'
import { GlassCard } from '@/components/common/GlassCard'
import { Button } from '@/components/ui/button'
import { CheckCircle2, PlayCircle, StepForward, MessageSquare } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { slideInRight } from '@/lib/animations'
import { toast } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import type { Video, Segment, VideoPart } from '@/types'

interface WatchClientWrapperProps {
  video: Video
  initialSegments: Segment[]
  nextVideoId?: string
  parts?: VideoPart[]
}

export function WatchClientWrapper({ video, initialSegments, nextVideoId, parts }: WatchClientWrapperProps) {
  const router = useRouter()
  const [showChatMobile, setShowChatMobile] = useState(false)
  const [activeTab, setActiveTab] = useState<'chat' | 'notes'>('chat')
  const playerControlsRef = useRef<{ seekTo: (time: number) => void, play: () => void, pause: () => void, getCurrentTime: () => number } | null>(null)
  
  const {
    segments,
    progressPercent,
    isComplete,
    handlePlay,
    handlePause,
    handleTimeUpdate,
  } = useWatchProgress({
    videoId: video.id,
    durationSeconds: video.durationSeconds,
    initialSegments,
  })

  // Resume logic
  const [startSeconds, setStartSeconds] = useState(0)
  const hasResumedRef = useRef(false)
  
  useEffect(() => {
    if (!hasResumedRef.current && initialSegments.length > 0) {
      const sorted = [...initialSegments].sort((a, b) => a.start - b.start)
      const last = sorted[sorted.length - 1]
      if (last && last.end < video.durationSeconds - 5) {
        setStartSeconds(last.end)
        toast(`Resumed from ${Math.floor(last.end / 60)}:${String(Math.floor(last.end % 60)).padStart(2, '0')}`, {
          icon: '▶️',
          id: 'resume-toast'
        })
      }
      hasResumedRef.current = true
    }
  }, [initialSegments, video.durationSeconds])

  useEffect(() => {
    if (isComplete && !video.isCompleted) {
      toast.success('Video completed! 🎉', { duration: 4000 })
    }
  }, [isComplete, video.isCompleted])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      
      {/* Left Column: Player & Details */}
      <div className="lg:col-span-2 space-y-6">
        <div className="space-y-4">
          <YouTubePlayer
            videoId={video.youtubeVideoId}
            startSeconds={startSeconds}
            onReady={(controls) => {
              playerControlsRef.current = controls
            }}
            onPlay={(time) => handlePlay(time)}
            onTimeUpdate={(time) => {
              setStartSeconds(time)
              handleTimeUpdate(time)
            }}
            onPause={(time) => handlePause(time)}
            onEnded={(time) => handlePause(time)}
          />
          <ProgressBar segments={segments} durationSeconds={video.durationSeconds} />
        </div>

        {/* Mobile Chat Toggle */}
        <div className="lg:hidden">
          <Button 
            variant="outline" 
            className="w-full bg-white/[0.02]"
            onClick={() => setShowChatMobile(!showChatMobile)}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            {showChatMobile ? 'Hide AI Chat' : 'Ask AI about this video'}
          </Button>
        </div>

        {/* Details Card */}
        <GlassCard padding="lg" variant="elevated" className="relative overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-tr from-green-500/5 via-transparent to-transparent transition-opacity duration-1000 ${isComplete ? 'opacity-100' : 'opacity-0'}`} />

          <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-2 flex-1">
              <h1 className="font-heading font-bold text-2xl text-[--text-primary]">
                {video.title}
              </h1>
              
              <div className="flex items-center gap-4 text-sm font-medium">
                <span className="text-[--text-secondary]">
                  Part {video.orderIndex + 1}
                </span>
                
                <AnimatePresence mode="popLayout">
                  {isComplete ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-1.5 text-green-400"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Completed
                    </motion.div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-1.5 text-blue-400"
                    >
                      <PlayCircle className="w-4 h-4" />
                      {Math.round(progressPercent)}% Watched
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Next Video Button */}
            {nextVideoId && isComplete && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button 
                  onClick={() => router.push(`/watch/${nextVideoId}`)}
                  className="w-full md:w-auto bg-white/[0.05] hover:bg-white/[0.1] text-white border-white/[0.1]"
                >
                  Next Video
                  <StepForward className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}
          </div>
        </GlassCard>

        {/* Video Parts (Phase 4 placeholder) */}
        {parts && parts.length > 0 && (
          <VideoParts 
            parts={parts} 
            onSeek={(seconds) => {
              toast('Seeking not fully wired in UI yet.', { icon: 'ℹ️' })
            }} 
          />
        )}
      </div>

      {/* Right Column: AI Chat / Notes */}
      <motion.div 
        variants={slideInRight}
        initial="hidden"
        animate="show"
        className={cn("lg:col-span-1 lg:block h-full", showChatMobile ? "block" : "hidden")}
      >
        <div className="sticky top-6 h-[calc(100vh-100px)] flex flex-col gap-4">
          <div className="flex items-center gap-2 p-1 bg-black/40 rounded-xl border border-white/[0.05]">
            <button
              onClick={() => setActiveTab('chat')}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-lg transition-colors",
                activeTab === 'chat' ? "bg-white/[0.1] text-white" : "text-[--text-muted] hover:text-[--text-secondary]"
              )}
            >
              AI Q&A
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-lg transition-colors",
                activeTab === 'notes' ? "bg-white/[0.1] text-white" : "text-[--text-muted] hover:text-[--text-secondary]"
              )}
            >
              Notes
            </button>
          </div>
          
          <div className="flex-1 overflow-hidden">
            {activeTab === 'chat' ? (
              <TranscriptChat video={video} />
            ) : (
              <TimestampNotes 
                videoId={video.id}
                videoTitle={video.title}
                currentPlayhead={currentPlayhead}
                onSeek={(seconds) => {
                  playerControlsRef.current?.seekTo(seconds)
                  playerControlsRef.current?.play()
                }}
              />
            )}
          </div>
        </div>
      </motion.div>

    </div>
  )
}
