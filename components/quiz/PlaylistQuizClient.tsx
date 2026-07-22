'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trophy } from 'lucide-react'
import { QuizHistory } from './QuizHistory'
import { FinalQuizModal } from './FinalQuizModal'

interface PlaylistQuizClientProps {
  playlistId: string
  courseTitle: string
  videos: { id: string; title: string }[]
  combinedTranscript: string
  isFullyCompleted: boolean
}

export function PlaylistQuizClient({ playlistId, courseTitle, videos, combinedTranscript, isFullyCompleted }: PlaylistQuizClientProps) {
  const [showFinalQuiz, setShowFinalQuiz] = useState(false)
  const [key, setKey] = useState(0)

  return (
    <div className="space-y-8 mt-10">
      {isFullyCompleted && (
        <div className="p-6 bg-primary/10 border border-primary/20 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-primary flex items-center gap-2">
              <Trophy className="w-6 h-6" /> Course Completed!
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              You've watched all videos. Take the final exam to test your knowledge.
            </p>
          </div>
          <Button size="lg" onClick={() => setShowFinalQuiz(true)} className="shrink-0">
            Take Final Exam
          </Button>
        </div>
      )}

      <QuizHistory 
        key={key}
        playlistId={playlistId} 
        videos={videos} 
        onRetakeQuiz={(videoId) => {
          window.location.href = `/watch/${videoId}?quiz=true`
        }} 
      />

      {showFinalQuiz && (
        <FinalQuizModal
          playlistId={playlistId}
          courseTitle={courseTitle}
          videoTitles={videos.map(v => v.title)}
          combinedTranscript={combinedTranscript}
          onComplete={() => {
            setShowFinalQuiz(false)
            setKey(k => k + 1)
          }}
          onSkip={() => setShowFinalQuiz(false)}
        />
      )}
    </div>
  )
}
