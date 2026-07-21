'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeInUp } from '@/lib/animations'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/common/GlassCard'
import { Link2, Search, X, GripVertical, AlertCircle, PlayCircle } from 'lucide-react'
import Image from 'next/image'
import { formatDuration } from '@/lib/utils'
import type { YouTubeVideoMeta } from '@/types'

// ─────────────────────────────────────────────────────────────
// MultiVideoInput Component
// For building custom playlists from individual video URLs
// ─────────────────────────────────────────────────────────────

interface MultiVideoInputProps {
  videos: YouTubeVideoMeta[]
  onVideosChange: (videos: YouTubeVideoMeta[]) => void
}

export function MultiVideoInput({ videos, onVideosChange }: MultiVideoInputProps) {
  const [url, setUrl] = useState('')
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFetch = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!url.trim()) return

    // Quick regex to extract video ID for validation before fetch
    const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11}).*/)
    const videoId = match ? match[1] : null

    if (!videoId) {
      setError('Invalid YouTube video URL')
      return
    }

    if (videos.some(v => v.youtubeVideoId === videoId)) {
      setError('Video is already in the list')
      return
    }

    setIsFetching(true)
    setError(null)

    try {
      const res = await fetch(`/api/youtube/video?videoId=${videoId}`)
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to fetch video')

      // Add to list
      const newVideo = { ...data, orderIndex: videos.length }
      onVideosChange([...videos, newVideo])
      setUrl('')
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setIsFetching(false)
    }
  }

  const removeVideo = (index: number) => {
    const newVideos = videos.filter((_, i) => i !== index)
    // Re-index
    onVideosChange(newVideos.map((v, i) => ({ ...v, orderIndex: i })))
  }

  const moveVideo = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === videos.length - 1)
    ) return

    const newVideos = [...videos]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    
    // Swap elements
    const temp = newVideos[index]!
    newVideos[index] = newVideos[swapIndex]!
    newVideos[swapIndex] = temp

    // Re-index
    onVideosChange(newVideos.map((v, i) => ({ ...v, orderIndex: i })))
  }

  return (
    <div className="space-y-6">
      {/* Input area */}
      <motion.div variants={fadeInUp} initial="initial" animate="animate">
        <form onSubmit={handleFetch} className="flex flex-col gap-4">
          <div className="relative flex items-center">
            <div className="absolute left-4 text-[--text-muted]">
              <Link2 className="w-5 h-5" />
            </div>
            <Input
              type="url"
              placeholder="Paste individual video URL..."
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                if (error) setError(null)
              }}
              className="pl-12 pr-32 h-14 bg-white/[0.03] border-white/[0.08]"
            />
            <div className="absolute right-2">
              <Button
                type="submit"
                disabled={isFetching || !url.trim()}
                size="sm"
                className="h-10 px-4"
              >
                {isFetching ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Add
                  </>
                )}
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-start gap-2 text-red-400 bg-red-500/[0.1] border border-red-500/[0.2] p-3 rounded-xl text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </motion.div>

      {/* Video List */}
      <AnimatePresence>
        {videos.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {videos.map((video, index) => (
              <motion.div
                key={video.youtubeVideoId}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <GlassCard padding="sm" variant="subtle" className="flex items-center gap-4 group pr-2">
                  
                  {/* Reorder handles */}
                  <div className="flex flex-col gap-1 items-center shrink-0">
                    <button
                      type="button"
                      onClick={() => moveVideo(index, 'up')}
                      disabled={index === 0}
                      className="text-[--text-muted] hover:text-[--text-primary] disabled:opacity-30 p-1"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                    </button>
                    <GripVertical className="w-4 h-4 text-white/[0.1]" />
                    <button
                      type="button"
                      onClick={() => moveVideo(index, 'down')}
                      disabled={index === videos.length - 1}
                      className="text-[--text-muted] hover:text-[--text-primary] disabled:opacity-30 p-1"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </button>
                  </div>

                  {/* Thumbnail */}
                  <div className="relative w-24 aspect-video rounded-md overflow-hidden bg-white/[0.05] shrink-0">
                    {video.thumbnail ? (
                      <Image src={video.thumbnail} alt={video.title} fill sizes="96px" className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <PlayCircle className="w-4 h-4 text-[--text-muted]" />
                      </div>
                    )}
                  </div>

                  {/* Title & Duration */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-[--text-primary] line-clamp-1">
                      {video.title}
                    </h4>
                    <p className="text-xs text-[--text-secondary] mt-1">
                      {formatDuration(video.durationSeconds)}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeVideo(index)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[--text-muted] hover:text-red-400 hover:bg-red-500/[0.1] transition-colors shrink-0"
                    title="Remove video"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
