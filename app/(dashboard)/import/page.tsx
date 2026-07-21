'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { AnimatePresence, motion } from 'framer-motion'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { URLImport } from '@/components/import/URLImport'
import { PlaylistPreview } from '@/components/import/PlaylistPreview'
import { CommitmentForm } from '@/components/import/CommitmentForm'
import type { YouTubePlaylistData } from '@/types'

// ─────────────────────────────────────────────────────────────
// Import Page — /import
// Phase 2: YouTube Link import flow
// ─────────────────────────────────────────────────────────────

export default function ImportPage() {
  const router = useRouter()
  const [playlistData, setPlaylistData] = useState<YouTubePlaylistData | null>(null)
  const [isFetching, setIsFetching] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Handle save playlist to DB
  const handleSave = async (days: number, hoursPerDay: number, startDate: Date) => {
    if (!playlistData) return

    setIsSaving(true)
    const loadingToast = toast.loading('Saving course...')

    try {
      const res = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: playlistData.title,
          source: playlistData.playlistId ? 'youtube' : 'custom',
          youtubePlaylistId: playlistData.playlistId,
          thumbnail: playlistData.thumbnail,
          totalVideos: playlistData.videoCount,
          commitmentDays: days,
          hoursPerDay,
          startDate: startDate.toISOString(),
          deadline: new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000).toISOString(),
          videos: playlistData.videos,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save course')
      }

      toast.success('Course imported successfully!', { id: loadingToast })
      
      // Redirect to the new playlist detail page
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
            Import Course
          </h1>
          <p className="text-body text-[--text-secondary]">
            Paste a YouTube playlist or video link to get started.
          </p>
        </div>

        {/* 1. URL Input */}
        <URLImport
          isLoading={isFetching}
          setIsLoading={setIsFetching}
          onDataFetched={(data) => {
            setPlaylistData(data)
            toast.success('Playlist fetched successfully')
          }}
        />

        {/* 2 & 3. Preview and Commitment Form */}
        <AnimatePresence>
          {playlistData && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-8 overflow-hidden pt-4"
            >
              <div className="h-px bg-white/[0.06] w-full" />
              
              <PlaylistPreview data={playlistData} />
              
              <CommitmentForm
                totalDurationSeconds={playlistData.totalDurationSeconds}
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
