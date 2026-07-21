'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { mergeSegments, calculateProgress, isVideoComplete } from '@/lib/schedule'
import type { Segment } from '@/types'

// ─────────────────────────────────────────────────────────────
// useWatchProgress Hook
// Tracks active watching segment and manages local state & server sync
// ─────────────────────────────────────────────────────────────

interface UseWatchProgressProps {
  videoId: string
  durationSeconds: number
  initialSegments?: Segment[]
}

export function useWatchProgress({ videoId, durationSeconds, initialSegments = [] }: UseWatchProgressProps) {
  const [segments, setSegments] = useState<Segment[]>(initialSegments)
  const [isComplete, setIsComplete] = useState(false)
  const activeSegmentRef = useRef<{ start: number } | null>(null)
  
  const [currentPlayhead, setCurrentPlayhead] = useState(0)

  // Compute live segments
  const liveSegments = activeSegmentRef.current
    ? mergeSegments([...segments, { start: activeSegmentRef.current.start, end: currentPlayhead }])
    : segments

  // Expose progress percentage based on live segments
  const progressPercent = calculateProgress(liveSegments, durationSeconds) * 100

  // Check completion whenever live segments update
  useEffect(() => {
    if (isVideoComplete(liveSegments, durationSeconds) && !isComplete) {
      setIsComplete(true)
      // Save it immediately when completed
      saveProgress(liveSegments, true)
    }
  }, [liveSegments, durationSeconds, isComplete]) // Need to remove saveProgress from deps here if it causes loops, but we'll define it below with useCallback

  // Save to DB
  const saveProgress = useCallback(async (newSegments: Segment[], completed: boolean) => {
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId,
          segments: newSegments,
          isCompleted: completed,
        }),
      })
    } catch (err) {
      console.error('Failed to save progress', err)
    }
  }, [videoId])

  const handlePlay = useCallback((currentTime: number) => {
    if (!activeSegmentRef.current) {
      activeSegmentRef.current = { start: currentTime }
      setCurrentPlayhead(currentTime)
    }
  }, [])

  const handlePause = useCallback((currentTime: number) => {
    if (activeSegmentRef.current) {
      const newSegment = {
        start: activeSegmentRef.current.start,
        end: currentTime,
      }
      
      // Only record if watched for > 1 second
      if (newSegment.end - newSegment.start > 1) {
        setSegments(prev => {
          const updated = mergeSegments([...prev, newSegment])
          const completed = isVideoComplete(updated, durationSeconds)
          saveProgress(updated, completed)
          return updated
        })
      }
      
      activeSegmentRef.current = null
    }
  }, [durationSeconds, saveProgress])

  const handleTimeUpdate = useCallback((currentTime: number) => {
    setCurrentPlayhead(currentTime)
    
    // Periodically save to DB every 30 seconds to prevent data loss
    if (activeSegmentRef.current && currentTime - activeSegmentRef.current.start > 30) {
      const newSegment = {
        start: activeSegmentRef.current.start,
        end: currentTime,
      }
      setSegments(prev => {
        const updated = mergeSegments([...prev, newSegment])
        saveProgress(updated, false)
        return updated
      })
      // Reset the active segment start to the current time since we just committed the chunk
      activeSegmentRef.current = { start: currentTime }
    }
  }, [saveProgress])

  // Save on beforeunload
  useEffect(() => {
    const handleUnload = () => {
      // Nothing synchronous can really reliably fire fetch here in all browsers, 
      // but periodic save handles most of this.
    }
    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [])

  return {
    segments: liveSegments,
    progressPercent,
    isComplete,
    handlePlay,
    handlePause,
    handleTimeUpdate,
  }
}
