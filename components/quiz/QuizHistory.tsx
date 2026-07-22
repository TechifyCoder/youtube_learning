'use client'

import { useState, useEffect } from 'react'
import { QuizAttempt } from '@/types'
import { Button } from '@/components/ui/button'
import { Brain, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'

interface QuizHistoryProps {
  playlistId: string
  videos: { id: string; title: string }[]
  onRetakeQuiz: (videoId: string) => void
}

export function QuizHistory({ playlistId, videos, onRetakeQuiz }: QuizHistoryProps) {
  const [history, setHistory] = useState<QuizAttempt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch(`/api/quiz/history?playlistId=${playlistId}`)
        if (res.ok) {
          const data = await res.json()
          setHistory(data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [playlistId])

  if (loading) {
    return <div className="animate-pulse h-32 bg-secondary/50 rounded-lg"></div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Quiz Progress</h3>
      </div>
      
      <div className="grid gap-3">
        {videos.map((video, idx) => {
          const attempt = history.find(h => h.videoId === video.id && h.quizType === 'video')
          
          return (
            <div key={video.id} className="p-4 border border-border rounded-lg bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-medium">Video {idx + 1} — {video.title}</p>
                {attempt ? (
                  <div className="flex items-center gap-3 mt-1 text-sm">
                    <span className="font-semibold text-primary">Score: {attempt.score}%</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">Taken: {format(new Date(attempt.startedAt), 'MMM d, yyyy')}</span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mt-1 italic">Quiz not taken yet</p>
                )}
              </div>
              
              <Button 
                variant={attempt ? "ghost" : "default"} 
                size="sm" 
                onClick={() => onRetakeQuiz(video.id)}
                className="shrink-0 gap-2"
              >
                {attempt ? <RefreshCw className="w-3 h-3" /> : null}
                {attempt ? 'Retake Quiz' : 'Take Quiz'}
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
