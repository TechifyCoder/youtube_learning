'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { MultiVideoInput } from '@/components/import/MultiVideoInput'
import { CommitmentForm } from '@/components/import/CommitmentForm'
import { Input } from '@/components/ui/input'
import { GlassCard } from '@/components/common/GlassCard'
import type { YouTubeVideoMeta } from '@/types'
import { AnimatePresence, motion } from 'framer-motion'

// ─────────────────────────────────────────────────────────────
// Custom Playlist Page — /custom
// Phase 2: Build a custom playlist from individual videos
// ─────────────────────────────────────────────────────────────

export default function CustomPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [videos, setVideos] = useState<YouTubeVideoMeta[]>([])
  const [isSaving, setIsSaving] = useState(false)

  const totalDurationSeconds = videos.reduce((acc, v) => acc + v.durationSeconds, 0)

  const handleSave = async (days: number, hoursPerDay: number, startDate: Date) => {
    if (videos.length === 0) return
    if (!title.trim()) {
      toast.error('Please enter a course title')
      return
    }

    setIsSaving(true)
    const loadingToast = toast.loading('Saving custom course...')

    try {
      const res = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          source: 'custom',
          youtubePlaylistId: null,
          thumbnail: videos[0]?.thumbnail ?? null,
          totalVideos: videos.length,
          commitmentDays: days,
          hoursPerDay,
          startDate: startDate.toISOString(),
          deadline: new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000).toISOString(),
          videos: videos,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save course')
      }

      toast.success('Custom course created!', { id: loadingToast })
      router.push(`/playlist/${data.playlistId}`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to save course', { id: loadingToast })
      setIsSaving(false)
    }
  }

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-heading font-bold text-display text-[--text-primary] mb-3">
            Build Custom Course
          </h1>
          <p className="text-body text-[--text-secondary]">
            Combine individual YouTube videos into your own learning playlist.
          </p>
        </div>

        {/* 1. Title Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[--text-secondary] ml-1">
            Course Title
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Advanced React Patterns..."
            className="text-lg font-medium"
          />
        </div>

        {/* 2. Video Builder */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[--text-secondary] ml-1">
            Videos ({videos.length})
          </label>
          <MultiVideoInput
            videos={videos}
            onVideosChange={setVideos}
          />
        </div>

        {/* 3. Commitment Form (only shows if we have videos) */}
        <AnimatePresence>
          {videos.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-8 overflow-hidden pt-4"
            >
              <div className="h-px bg-white/[0.06] w-full" />
              
              <CommitmentForm
                totalDurationSeconds={totalDurationSeconds}
                onConfirm={handleSave}
                isLoading={isSaving}
              />
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </PageWrapper>
  )
}
