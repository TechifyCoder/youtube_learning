import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { videos, watchProgress, playlists } from '@/lib/db/schema'
import { eq, and, asc } from 'drizzle-orm'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { YouTubePlayer } from '@/components/player/YouTubePlayer'
import { ProgressBar } from '@/components/player/ProgressBar'
import { VideoParts } from '@/components/player/VideoParts'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import type { Segment, VideoPart } from '@/types'
import { splitLongVideo } from '@/lib/schedule'

// Client component wrapper for state
import { WatchClientWrapper } from './WatchClientWrapper'

interface Props {
  params: { videoId: string }
}

export default async function WatchPage({ params }: Props) {
  const session = await auth()
  if (!session?.user?.id) return redirect('/login')

  const userId = session.user.id

  // 1. Fetch video
  const [video] = await db
    .select()
    .from(videos)
    .where(and(eq(videos.id, params.videoId), eq(videos.userId, userId)))
    .limit(1)

  if (!video) return notFound()

  // 2. Fetch playlist context
  const [playlist] = await db
    .select()
    .from(playlists)
    .where(eq(playlists.id, video.playlistId))
    .limit(1)

  // 3. Fetch progress segments
  const [progress] = await db
    .select()
    .from(watchProgress)
    .where(and(eq(watchProgress.videoId, video.id), eq(watchProgress.userId, userId)))
    .limit(1)

  const initialSegments = (progress?.watchedSegments as Segment[]) || []

  // 4. Fetch next video in playlist
  const [nextVideo] = await db
    .select()
    .from(videos)
    .where(and(
      eq(videos.playlistId, video.playlistId),
      eq(videos.userId, userId)
    ))
    .orderBy(asc(videos.orderIndex))
    // Filter in JS for the exact next orderIndex, simpler than complex SQL for now
    .then(all => all.filter(v => v.orderIndex > video.orderIndex))
    .then(filtered => [filtered[0]])

  // Generate parts if video is very long (placeholder for Phase 4)
  const parts = video.durationSeconds > 3600 
    ? splitLongVideo(video as any, 3600) 
    : []

  return (
    <PageWrapper className="max-w-5xl mx-auto">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <Link 
          href={`/playlist/${video.playlistId}`}
          className="flex items-center gap-2 text-sm text-[--text-secondary] hover:text-[--text-primary] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {playlist?.title || 'course'}
        </Link>
      </div>

      <WatchClientWrapper 
        video={video as any}
        initialSegments={initialSegments}
        nextVideoId={nextVideo?.id}
        parts={parts}
      />
      
    </PageWrapper>
  )
}
