import { notFound } from 'next/navigation'
import Image from 'next/image'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Badge } from '@/components/common/Badge'
import { EmptyState } from '@/components/common/EmptyState'
import { VideoListItem } from '@/components/playlist/VideoListItem'
import { ScheduleCalendar } from '@/components/playlist/ScheduleCalendar'
import { db } from '@/lib/db'
import { playlists, videos, scheduleDays } from '@/lib/db/schema'
import { eq, and, asc } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { formatDate, formatDuration } from '@/lib/utils'
import { Calendar, Clock, PlayCircle } from 'lucide-react'

// ─────────────────────────────────────────────────────────────
// Playlist Detail Page
// ─────────────────────────────────────────────────────────────

interface Props {
  params: { id: string }
}

export const metadata = { title: 'Course Details' }

export default async function PlaylistPage({ params }: Props) {
  const session = await auth()
  if (!session?.user?.id) return notFound()

  // Fetch playlist
  const [playlist] = await db
    .select()
    .from(playlists)
    .where(and(eq(playlists.id, params.id), eq(playlists.userId, session.user.id)))
    .limit(1)

  if (!playlist) return notFound()

  // Fetch videos
  const playlistVideos = await db
    .select()
    .from(videos)
    .where(eq(videos.playlistId, playlist.id))
    .orderBy(videos.orderIndex)

  // Fetch schedule
  const playlistSchedule = await db
    .select()
    .from(scheduleDays)
    .where(eq(scheduleDays.playlistId, playlist.id))
    .orderBy(asc(scheduleDays.dayNumber))

  const completedCount = playlistVideos.filter((v) => v.isCompleted).length
  const progressPercent = Math.round((completedCount / (playlistVideos.length || 1)) * 100)
  const totalSeconds = playlistVideos.reduce((acc, v) => acc + v.durationSeconds, 0)

  // Calculate days remaining
  const today = new Date().toISOString().split('T')[0]!
  const deadlineStr = new Date(playlist.deadline).toISOString().split('T')[0]!
  const daysRemaining = Math.max(0, Math.ceil((new Date(deadlineStr).getTime() - new Date(today).getTime()) / (1000 * 3600 * 24)))

  return (
    <PageWrapper>
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start mb-10">
        
        {/* Thumbnail */}
        <div className="relative w-full md:w-64 aspect-video rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)] shrink-0 border border-white/[0.1]">
          {playlist.thumbnail ? (
            <Image 
              src={playlist.thumbnail} 
              alt={playlist.title} 
              fill 
              sizes="(max-width: 768px) 100vw, 256px" 
              className="object-cover" 
              priority
            />
          ) : (
            <div className="w-full h-full bg-white/[0.05] flex items-center justify-center">
              <PlayCircle className="w-10 h-10 text-[--text-muted]" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
          
          <Badge 
            variant={playlist.source as any} 
            className="absolute top-3 left-3 bg-black/60 backdrop-blur-md" 
          />
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <h1 className="font-heading font-bold text-display text-[--text-primary] mb-4 leading-tight">
            {playlist.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-6">
            <div className="flex items-center gap-2 text-sm text-[--text-secondary]">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>{formatDuration(totalSeconds)}</span>
              <span className="text-[--text-muted]">({playlistVideos.length} videos)</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[--text-secondary]">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span>Deadline: {formatDate(playlist.deadline)}</span>
              {daysRemaining > 0 ? (
                <span className="text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full text-xs ml-1">
                  {daysRemaining} days left
                </span>
              ) : (
                <span className="text-red-300 bg-red-500/10 px-2 py-0.5 rounded-full text-xs ml-1">
                  Past due
                </span>
              )}
            </div>
          </div>

          {/* Simple Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-[--text-secondary]">Progress</span>
              <span className="text-purple-400">{progressPercent}%</span>
            </div>
            <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden border border-white/[0.05]">
              <div 
                className="h-full bg-gradient-to-r from-purple-600 to-violet-500 transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* 2. Video List */}
        <div className="space-y-6">
          <h2 className="font-heading font-semibold text-xl text-[--text-primary]">
            Course Videos
          </h2>
          
          <div className="flex flex-col gap-3">
            {playlistVideos.map((video, index) => (
              <VideoListItem key={video.id} video={video as any} index={index} />
            ))}
            {playlistVideos.length === 0 && (
              <EmptyState
                icon={<PlayCircle className="w-6 h-6" />}
                title="No videos found"
                description="This playlist currently has no videos."
                className="py-12"
              />
            )}
          </div>
        </div>

        {/* 3. Schedule Calendar */}
        <div className="space-y-6">
          <h2 className="font-heading font-semibold text-xl text-[--text-primary]">
            Daily Schedule
          </h2>
          <ScheduleCalendar 
            schedule={playlistSchedule as any[]} 
            videos={playlistVideos as any[]} 
          />
        </div>

      </div>
    </PageWrapper>
  )
}
