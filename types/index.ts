// ─────────────────────────────────────────────────────────────
// LearnLoop — All TypeScript Interfaces
// All types go here. Import from '@/types' everywhere.
// ─────────────────────────────────────────────────────────────

// ─── Auth ────────────────────────────────────────────────────
export interface User {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
  createdAt: Date
}

// ─── Playlists ───────────────────────────────────────────────
export type PlaylistSource = 'youtube' | 'custom'

export interface Playlist {
  id: string
  userId: string
  title: string
  source: PlaylistSource
  youtubePlaylistId: string | null
  thumbnail: string | null
  totalVideos: number
  commitmentDays: number
  hoursPerDay: number | null
  startDate: Date
  deadline: Date
  createdAt: Date
}

// ─── Videos ─────────────────────────────────────────────────
export interface Video {
  id: string
  playlistId: string
  userId: string
  youtubeVideoId: string
  title: string
  thumbnail: string | null
  durationSeconds: number
  orderIndex: number
  isCompleted: boolean
  transcript: string | null
  createdAt: Date
}

// ─── Watch Progress ──────────────────────────────────────────
export interface Segment {
  start: number
  end: number
}

export interface WatchProgress {
  id: string
  videoId: string
  userId: string
  watchedSegments: Segment[]
  totalWatchedSeconds: number
  lastWatchedAt: Date | null
}

// ─── Schedule ────────────────────────────────────────────────
export type ScheduleStatus = 'upcoming' | 'on_track' | 'behind' | 'completed'

export interface ScheduleDay {
  id: string
  playlistId: string
  dayNumber: number
  date: Date
  videoIds: string[]
  targetMinutes: number
  isCompleted: boolean
  status: ScheduleStatus
}

// ─── YouTube API Responses ───────────────────────────────────
export interface YouTubeVideoMeta {
  youtubeVideoId: string
  title: string
  thumbnail: string
  durationSeconds: number
  orderIndex: number
}

export interface YouTubePlaylistData {
  playlistId: string
  title: string
  thumbnail: string
  videos: YouTubeVideoMeta[]
  totalDurationSeconds: number
  videoCount: number
}

export type YouTubeErrorCode =
  | 'INVALID_URL'
  | 'QUOTA_EXCEEDED'
  | 'NOT_FOUND'
  | 'PRIVATE'
  | 'UNKNOWN'

export interface YouTubeError {
  error: string
  code: YouTubeErrorCode
}

// ─── Transcript ──────────────────────────────────────────────
export interface TranscriptLine {
  text: string
  offset: number
  duration: number
}

// ─── Video Parts (for split long videos) ────────────────────
export type PartStatus = 'watched' | 'partial' | 'not_started'

export interface VideoPart {
  partNumber: number
  startSeconds: number
  endSeconds: number
  status: PartStatus
}

// ─── API Response Shapes ─────────────────────────────────────
export interface ApiError {
  error: string
  code?: string
  details?: unknown
}

export interface ProgressResponse {
  totalWatchedSeconds: number
  completionPercent: number
  isCompleted: boolean
}

// ─── Dashboard ───────────────────────────────────────────────
export interface CourseCardData {
  playlist: Playlist
  completedVideos: number
  totalVideos: number
  totalWatchedSeconds: number
  totalDurationSeconds: number
  scheduleStatus: 'completed' | 'on_track' | 'behind' | 'upcoming'
  currentDay: number | null
  totalDays?: number
  targetMinutes?: number | null
}

export interface StatsData {
  totalHoursWatched: number
  activeCoursesCount: number
  completedCoursesCount: number
}
