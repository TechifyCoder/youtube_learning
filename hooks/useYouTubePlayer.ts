'use client'

import { useEffect, useState, useRef, useCallback } from 'react'

// ─────────────────────────────────────────────────────────────
// useYouTubePlayer Hook
// Loads IFrame API and wraps it in a React hook
// ─────────────────────────────────────────────────────────────

interface UseYouTubePlayerOptions {
  videoId: string
  onReady?: () => void
  onStateChange?: (state: number) => void
  onEnded?: (time: number) => void
  onPause?: (time: number) => void
  onPlay?: (time: number) => void
  onTimeUpdate?: (time: number) => void
  startSeconds?: number
}

// YT Player States
export const YT_UNSTARTED = -1
export const YT_ENDED = 0
export const YT_PLAYING = 1
export const YT_PAUSED = 2
export const YT_BUFFERING = 3
export const YT_CUED = 5

export function useYouTubePlayer({
  videoId,
  onReady,
  onStateChange,
  onEnded,
  onPause,
  onPlay,
  onTimeUpdate,
  startSeconds = 0,
}: UseYouTubePlayerOptions) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<any>(null)
  const [isReady, setIsReady] = useState(false)
  const timerRef = useRef<number | null>(null)

  // Keep latest callbacks in refs to avoid stale closures inside the YT IFrame API
  const callbacksRef = useRef({
    onReady,
    onStateChange,
    onPlay,
    onPause,
    onEnded,
    onTimeUpdate,
  })

  // Update refs on every render
  useEffect(() => {
    callbacksRef.current = {
      onReady,
      onStateChange,
      onPlay,
      onPause,
      onEnded,
      onTimeUpdate,
    }
  })

  // Track time updates using interval when playing
  const startTimeTracking = useCallback(() => {
    if (timerRef.current) return
    timerRef.current = window.setInterval(() => {
      if (playerRef.current?.getCurrentTime && callbacksRef.current.onTimeUpdate) {
        callbacksRef.current.onTimeUpdate(playerRef.current.getCurrentTime())
      }
    }, 1000)
  }, [])

  const stopTimeTracking = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  // Load API and initialize player
  useEffect(() => {
    if (!videoId) return

    let isMounted = true

    // Callback when API is ready
    const initPlayer = () => {
      if (!isMounted || !containerRef.current) return
      if (playerRef.current) return // Already initialized

      playerRef.current = new (window as any).YT.Player(containerRef.current, {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 0,
          rel: 0,
          modestbranding: 1,
          start: startSeconds,
          fs: 1,
          playsinline: 1,
        },
        events: {
          onReady: (event: any) => {
            if (isMounted) {
              setIsReady(true)
              callbacksRef.current.onReady?.()
            }
          },
          onStateChange: (event: any) => {
            const state = event.data
            callbacksRef.current.onStateChange?.(state)
            
            const currentTime = playerRef.current?.getCurrentTime?.() || 0

            if (state === YT_PLAYING) {
              callbacksRef.current.onPlay?.(currentTime)
              startTimeTracking()
            } else {
              stopTimeTracking()
            }

            if (state === YT_PAUSED) {
              callbacksRef.current.onPause?.(currentTime)
            }

            if (state === YT_ENDED) {
              callbacksRef.current.onEnded?.(currentTime)
            }
          },
        },
      })
    }

    // Load IFrame API if not loaded
    if (!(window as any).YT || !(window as any).YT.Player) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
      } else {
        document.head.appendChild(tag)
      }

      // If multiple components are waiting, chain the callbacks
      const previousCallback = (window as any).onYouTubeIframeAPIReady
      ;(window as any).onYouTubeIframeAPIReady = () => {
        if (previousCallback) previousCallback()
        initPlayer()
      }
    } else {
      initPlayer()
    }

    return () => {
      isMounted = false
      stopTimeTracking()
      if (playerRef.current?.destroy) {
        playerRef.current.destroy()
        playerRef.current = null
      }
    }
  }, [videoId]) // Re-init if videoId changes

  // Expose controls
  const play = useCallback(() => playerRef.current?.playVideo?.(), [])
  const pause = useCallback(() => playerRef.current?.pauseVideo?.(), [])
  const seekTo = useCallback((seconds: number) => playerRef.current?.seekTo?.(seconds, true), [])
  const getCurrentTime = useCallback(() => playerRef.current?.getCurrentTime?.() ?? 0, [])
  const getDuration = useCallback(() => playerRef.current?.getDuration?.() ?? 0, [])

  return {
    containerRef,
    isReady,
    play,
    pause,
    seekTo,
    getCurrentTime,
    getDuration,
  }
}
