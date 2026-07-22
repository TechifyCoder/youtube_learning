import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { videos, watchProgress, playlists } from '@/lib/db/schema'
import { eq, and, asc } from 'drizzle-orm'
import { ArrowLeft } from 'lucide-react'
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
    .then(all => all.filter(v => v.orderIndex > video.orderIndex))
    .then(filtered => [filtered[0] ?? null])

  // Generate parts if video is very long
  const parts = video.durationSeconds > 3600 
    ? splitLongVideo(video as any, 3600) 
    : []

  return (
    <div className="-mx-4 md:-mx-8 -mt-6 -mb-8 flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 0px)' }}>
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-white/[0.05] shrink-0">
        <Link 
          href={`/playlist/${video.playlistId}`}
          className="flex items-center gap-2 text-sm text-[--text-secondary] hover:text-[--text-primary] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {playlist?.title || 'course'}
        </Link>
      </div>

      {/* Full-bleed resizable content area */}
      <div className="flex-1 overflow-hidden p-4 md:p-6">
        <WatchClientWrapper 
          video={video as any}
          initialSegments={initialSegments}
          nextVideoId={nextVideo?.id}
          parts={parts}
        />
      </div>
    </div>
  )
}
