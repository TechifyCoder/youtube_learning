'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useWatchProgress } from '@/hooks/useWatchProgress'
import { YouTubePlayer } from '@/components/player/YouTubePlayer'
import { ProgressBar } from '@/components/player/ProgressBar'
import { VideoParts } from '@/components/player/VideoParts'
import { TranscriptChat } from '@/components/player/TranscriptChat'
import { TimestampNotes } from '@/components/player/TimestampNotes'
import { QuizTriggerBanner } from '@/components/quiz/QuizTriggerBanner'
import { QuizModal } from '@/components/quiz/QuizModal'
import { GlassCard } from '@/components/common/GlassCard'
import { Button } from '@/components/ui/button'
import { CheckCircle2, PlayCircle, StepForward, MessageSquare, GripVertical, Brain } from 'lucide-react'
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
  existingAttempt?: any
}

export function WatchClientWrapper({ video, initialSegments, nextVideoId, parts, existingAttempt }: WatchClientWrapperProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [showChatMobile, setShowChatMobile] = useState(false)
  const [activeTab, setActiveTab] = useState<'chat' | 'notes' | 'quiz'>(
    searchParams.get('quiz') === 'true' ? 'quiz' : 'chat'
  )
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
  
  // Quiz logic
  const [showQuizBanner, setShowQuizBanner] = useState(false)
  const [showQuizModal, setShowQuizModal] = useState(searchParams.get('quiz') === 'true')
  const hasTriggeredQuizRef = useRef(false)

  useEffect(() => {
    if (isComplete && !hasTriggeredQuizRef.current) {
      setShowQuizBanner(true)
      hasTriggeredQuizRef.current = true
    }
  }, [isComplete])

  
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

  // ─── Resizable panel state ────────────────────────────────────
  const [leftPercent, setLeftPercent] = useState(62) // default 62% left
  const [isDesktop, setIsDesktop] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  // Detect desktop after mount to avoid SSR mismatch
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    isDragging.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    const onMove = (moveEvent: PointerEvent) => {
      if (!isDragging.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const raw = ((moveEvent.clientX - rect.left) / rect.width) * 100
      setLeftPercent(Math.max(30, Math.min(raw, 75)))
    }

    const onUp = () => {
      isDragging.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }, [])

  const rightPercent = 100 - leftPercent

  return (
    <div className="h-full flex flex-col lg:flex-row gap-0 overflow-hidden" ref={containerRef}>

      {/* ── LEFT PANEL: Player + Details ── */}
      <div
        className="flex flex-col min-h-0 overflow-y-auto lg:overflow-hidden w-full"
        style={isDesktop ? { width: `${leftPercent}%` } : {}}
      >
        <div className="flex flex-col h-full space-y-4 pr-0 lg:pr-2 overflow-y-auto">
          {/* Player */}
          <div className="shrink-0">
            <YouTubePlayer
              videoId={video.youtubeVideoId}
              startSeconds={startSeconds}
              onReady={(controls) => { playerControlsRef.current = controls }}
              onPlay={(time) => handlePlay(time)}
              onTimeUpdate={(time) => {
                setStartSeconds(time)
                handleTimeUpdate(time)
              }}
              onPause={(time) => handlePause(time)}
              onEnded={(time) => handlePause(time)}
            />
            <div className="mt-2">
              <ProgressBar segments={segments} durationSeconds={video.durationSeconds} />
            </div>
          </div>

          {/* Mobile Chat Toggle */}
          <div className="lg:hidden shrink-0">
            <Button 
              variant="default" 
              className="w-full bg-white/[0.02]"
              onClick={() => setShowChatMobile(!showChatMobile)}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              {showChatMobile ? 'Hide AI Chat' : 'Ask AI about this video'}
            </Button>
          </div>

          {/* Details Card */}
          <GlassCard padding="lg" variant="elevated" className="relative overflow-hidden shrink-0">
            <div className={`absolute inset-0 bg-gradient-to-tr from-green-500/5 via-transparent to-transparent transition-opacity duration-1000 ${isComplete ? 'opacity-100' : 'opacity-0'}`} />
            <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-2 flex-1 min-w-0">
                <h1 className="font-heading font-bold text-xl text-[--text-primary] line-clamp-2">
                  {video.title}
                </h1>
                <div className="flex items-center gap-4 text-sm font-medium">
                  <span className="text-[--text-secondary]">Part {video.orderIndex + 1}</span>
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
              {nextVideoId && isComplete && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="shrink-0"
                >
                  <Button 
                    onClick={() => router.push(`/watch/${nextVideoId}`)}
                    className="bg-white/[0.05] hover:bg-white/[0.1] text-white border-white/[0.1]"
                  >
                    Next Video
                    <StepForward className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              )}
            </div>
          </GlassCard>

          {/* Video Parts */}
          {parts && parts.length > 0 && (
            <div className="shrink-0">
              <VideoParts 
                parts={parts} 
                onSeek={(seconds) => {
                  toast('Seeking not fully wired in UI yet.', { icon: 'ℹ️' })
                }} 
              />
            </div>
          )}
        </div>
      </div>

      {/* ── RESIZER HANDLE (Desktop only) ── */}
      <div
        className="hidden lg:flex items-center justify-center w-3 cursor-col-resize shrink-0 group select-none"
        onPointerDown={handlePointerDown}
      >
        <div className="w-1 h-16 rounded-full bg-white/[0.08] group-hover:bg-purple-500/60 group-active:bg-purple-500 transition-all duration-150 flex items-center justify-center">
          <GripVertical className="w-3 h-3 text-white/20 group-hover:text-purple-300 transition-colors" />
        </div>
      </div>

      {/* ── RIGHT PANEL: AI Chat / Notes ── */}
      {/* Mobile: Slide-up overlay / Desktop: Side panel */}
      <motion.div
        variants={slideInRight}
        initial="hidden"
        animate="show"
        className={cn(
          "flex flex-col min-h-0 overflow-hidden",
          /* Mobile: fixed bottom sheet when visible */
          "lg:pl-2 lg:static lg:flex",
          showChatMobile
            ? "fixed inset-x-0 bottom-0 top-[30%] z-50 bg-[--bg-primary] border-t border-white/[0.08] rounded-t-2xl shadow-2xl flex"
            : "hidden lg:flex"
        )}
        style={isDesktop ? { width: `${rightPercent}%` } : {}}
      >
        {/* Mobile drag handle + close */}
        <div className="lg:hidden flex flex-col items-center pt-2 pb-0 shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/20 mb-3" />
          <div className="w-full flex items-center justify-between px-4 pb-2">
            <span className="text-sm font-semibold text-[--text-primary]">AI Tools</span>
            <button
              onClick={() => setShowChatMobile(false)}
              className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-[--text-muted] hover:text-[--text-primary] transition-colors"
              aria-label="Close panel"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 p-1 mx-4 lg:mx-0 bg-black/40 rounded-xl border border-white/[0.05] mb-3 shrink-0">
          <button
            onClick={() => setActiveTab('chat')}
            className={cn(
              "flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-150",
              activeTab === 'chat'
                ? "bg-purple-600/80 text-white shadow-sm"
                : "text-[--text-muted] hover:text-[--text-secondary] hover:bg-white/[0.04]"
            )}
          >
            AI Q&A
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={cn(
              "flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-150",
              activeTab === 'notes'
                ? "bg-purple-600/80 text-white shadow-sm"
                : "text-[--text-muted] hover:text-[--text-secondary] hover:bg-white/[0.04]"
            )}
          >
            Notes
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={cn(
              "flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-150",
              activeTab === 'quiz'
                ? "bg-purple-600/80 text-white shadow-sm"
                : "text-[--text-muted] hover:text-[--text-secondary] hover:bg-white/[0.04]"
            )}
          >
            Quiz
          </button>
        </div>

        {/* Panel content — fills remaining height */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {activeTab === 'chat' ? (
            <TranscriptChat video={video} />
          ) : activeTab === 'notes' ? (
            <TimestampNotes 
              videoId={video.id}
              youtubeVideoId={video.youtubeVideoId}
              videoTitle={video.title}
              currentPlayhead={startSeconds}
              onSeek={(seconds) => {
                playerControlsRef.current?.seekTo(seconds)
                playerControlsRef.current?.play()
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mb-4">
                <Brain className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold">Practice What You Learned</h3>
              <p className="text-muted-foreground text-sm max-w-sm">
                Take a quick AI-generated quiz based on this video's transcript to reinforce your understanding.
              </p>
              
              {existingAttempt ? (
                <div className="mt-6 flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2">
                    {existingAttempt.isComplete ? (
                      <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-green-500/10 text-green-400 rounded-md flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Completed (Score: {existingAttempt.score}%)
                      </span>
                    ) : (
                      <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-yellow-500/10 text-yellow-400 rounded-md">
                        Pending (Incomplete)
                      </span>
                    )}
                  </div>
                  {existingAttempt.isComplete ? (
                    <Button onClick={() => router.push('/quizzes')} size="lg" className="w-full max-w-[200px]">
                      Review Results
                    </Button>
                  ) : (
                    <Button onClick={() => setShowQuizModal(true)} size="lg" className="w-full max-w-[200px]">
                      Resume Quiz
                    </Button>
                  )}
                </div>
              ) : (
                <Button 
                  onClick={() => setShowQuizModal(true)} 
                  className="mt-6"
                  size="lg"
                >
                  Start Quiz Now
                </Button>
              )}
            </div>
          )}
        </div>
      </motion.div>

      <QuizTriggerBanner
        isVisible={showQuizBanner}
        onSkip={() => setShowQuizBanner(false)}
        onStartQuiz={() => {
          setShowQuizBanner(false)
          setShowQuizModal(true)
        }}
      />
      
      {showQuizModal && (
        <QuizModal
          videoId={video.id}
          playlistId={video.playlistId}
          transcript={video.transcript || ''}
          videoTitle={video.title}
          existingAttempt={existingAttempt}
          onComplete={(score) => setShowQuizModal(false)}
          onSkip={() => setShowQuizModal(false)}
        />
      )}
    </div>
  )
}
