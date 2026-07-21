'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeInUp } from '@/lib/animations'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Link2, AlertCircle, Search } from 'lucide-react'
import type { YouTubePlaylistData } from '@/types'

// ─────────────────────────────────────────────────────────────
// URLImport Component
// Input field for YouTube URL with fetch logic and error handling
// ─────────────────────────────────────────────────────────────

interface URLImportProps {
  onDataFetched: (data: YouTubePlaylistData) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export function URLImport({ onDataFetched, isLoading, setIsLoading }: URLImportProps) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleFetch = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!url.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/youtube/playlist?url=${encodeURIComponent(url.trim())}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch playlist')
      }

      onDataFetched(data as YouTubePlaylistData)
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div variants={fadeInUp} initial="initial" animate="animate">
      <form onSubmit={handleFetch} className="flex flex-col gap-4">
        
        <div className="relative flex items-center">
          <div className="absolute left-4 text-[--text-muted]">
            <Link2 className="w-5 h-5" />
          </div>
          <Input
            type="url"
            placeholder="Paste YouTube playlist or video URL..."
            value={url}
            onChange={(e) => {
              setUrl(e.target.value)
              if (error) setError(null)
            }}
            className="pl-12 pr-32 h-14 text-base bg-white/[0.03] border-white/[0.08]"
            required
          />
          <div className="absolute right-2">
            <Button
              type="submit"
              disabled={isLoading || !url.trim()}
              size="sm"
              className="h-10 px-4"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Fetch
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Error message */}
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
  )
}
