import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  date,
  jsonb,
  decimal,
  unique,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ─────────────────────────────────────────────────────────────
// LearnLoop — Database Schema
// All 5 tables from ARCHITECTURE.md Section 4
// ─────────────────────────────────────────────────────────────

// ─── Table: users ─────────────────────────────────────────────
export const users = pgTable('users', {
  id:             uuid('id').primaryKey().defaultRandom(),
  email:          text('email').unique().notNull(),
  name:           text('name'),
  avatarUrl:      text('avatar_url'),
  streakCount:    integer('streak_count').default(0).notNull(),
  longestStreak:  integer('longest_streak').default(0).notNull(),
  lastActiveDate: date('last_active_date'),
  username:       text('username').unique(),
  bio:            text('bio'),
  isPublic:       boolean('is_public').default(false).notNull(),
  settings:       jsonb('settings').default({ reminderEnabled: false, reminderTime: '09:00' }).notNull(),
  createdAt:      timestamp('created_at').defaultNow().notNull(),
})

// ─── Table: playlists ─────────────────────────────────────────
export const playlists = pgTable('playlists', {
  id:                  uuid('id').primaryKey().defaultRandom(),
  userId:              uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title:               text('title').notNull(),
  source:              text('source').notNull(),         // 'youtube' | 'custom'
  youtubePlaylistId:   text('youtube_playlist_id'),      // null for custom
  thumbnail:           text('thumbnail'),
  totalVideos:         integer('total_videos').default(0).notNull(),
  commitmentDays:      integer('commitment_days').notNull(),
  hoursPerDay:         decimal('hours_per_day', { precision: 4, scale: 2 }),
  startDate:           date('start_date').notNull(),
  deadline:            date('deadline').notNull(),       // start_date + commitment_days
  createdAt:           timestamp('created_at').defaultNow().notNull(),
})

// ─── Table: videos ────────────────────────────────────────────
export const videos = pgTable('videos', {
  id: uuid('id').primaryKey().defaultRandom(),
  playlistId: uuid('playlist_id').notNull().references(() => playlists.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  youtubeVideoId: text('youtube_video_id').notNull(),
  title: text('title').notNull(),
  thumbnail: text('thumbnail'),
  durationSeconds: integer('duration_seconds').notNull(),
  orderIndex: integer('order_index').notNull(),
  isCompleted: boolean('is_completed').default(false).notNull(),
  transcript: text('transcript'), // Phase 5: Cached transcript text
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ─── Table: watch_progress ────────────────────────────────────
export const watchProgress = pgTable(
  'watch_progress',
  {
    id:                   uuid('id').primaryKey().defaultRandom(),
    videoId:              uuid('video_id').references(() => videos.id, { onDelete: 'cascade' }).notNull(),
    userId:               uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    // JSON array: [{"start": 60, "end": 1200}, {"start": 1500, "end": 2100}]
    watchedSegments:      jsonb('watched_segments').default([]).notNull(),
    totalWatchedSeconds:  integer('total_watched_seconds').default(0).notNull(),
    lastWatchedAt:        timestamp('last_watched_at'),
  },
  (table) => ({
    // One progress row per user per video
    uniqueVideoUser: unique('watch_progress_video_user_unique').on(table.videoId, table.userId),
  })
)

// ─── Table: schedule_days ─────────────────────────────────────
export const scheduleDays = pgTable('schedule_days', {
  id:            uuid('id').primaryKey().defaultRandom(),
  playlistId:    uuid('playlist_id').references(() => playlists.id, { onDelete: 'cascade' }).notNull(),
  dayNumber:     integer('day_number').notNull(),
  date:          date('date').notNull(),
  // JSON array: ["uuid1", "uuid2"] — video IDs for this day
  videoIds:      jsonb('video_ids').notNull(),
  targetMinutes: integer('target_minutes').notNull(),
  isCompleted:   boolean('is_completed').default(false).notNull(),
  status:        text('status').default('upcoming').notNull(), // 'upcoming' | 'on_track' | 'behind' | 'completed'
})

// ─── Table: activity_log ──────────────────────────────────────
export const activityLog = pgTable('activity_log', {
  id:             uuid('id').primaryKey().defaultRandom(),
  userId:         uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  date:           date('date').notNull(),
  minutesWatched: integer('minutes_watched').default(0).notNull(),
  videosWatched:  integer('videos_watched').default(0).notNull(),
}, (table) => ({
  uniqueUserDate: unique('activity_log_user_date_unique').on(table.userId, table.date)
}))

// ─── Table: certificates ──────────────────────────────────────
export const certificates = pgTable('certificates', {
  id:          uuid('id').primaryKey().defaultRandom(),
  userId:      uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  playlistId:  uuid('playlist_id').references(() => playlists.id, { onDelete: 'cascade' }).notNull(),
  issuedAt:    timestamp('issued_at').defaultNow().notNull(),
  totalHours:  decimal('total_hours', { precision: 10, scale: 2 }).notNull(),
  shareToken:  text('share_token').unique().notNull(),
}, (table) => ({
  uniqueUserPlaylist: unique('certificates_user_playlist_unique').on(table.userId, table.playlistId)
}))

// ─── Table: notes ─────────────────────────────────────────────
export const notes = pgTable('notes', {
  id:               uuid('id').primaryKey().defaultRandom(),
  videoId:          uuid('video_id').references(() => videos.id, { onDelete: 'cascade' }).notNull(),
  userId:           uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  content:          text('content').notNull(),
  timestampSeconds: integer('timestamp_seconds').notNull(),
  endTimestampSeconds: integer('end_timestamp_seconds'),
  createdAt:        timestamp('created_at').defaultNow().notNull(),
})

// ─────────────────────────────────────────────────────────────
// Relations (for Drizzle query API)
// ─────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  playlists:     many(playlists),
  videos:        many(videos),
  watchProgress: many(watchProgress),
  activityLog:   many(activityLog),
  certificates:  many(certificates),
  notes:         many(notes),
}))

export const playlistsRelations = relations(playlists, ({ one, many }) => ({
  user:         one(users, { fields: [playlists.userId], references: [users.id] }),
  videos:       many(videos),
  scheduleDays: many(scheduleDays),
  certificates: many(certificates),
}))

export const videosRelations = relations(videos, ({ one, many }) => ({
  playlist:      one(playlists, { fields: [videos.playlistId], references: [playlists.id] }),
  user:          one(users,     { fields: [videos.userId],     references: [users.id] }),
  watchProgress: many(watchProgress),
  notes:         many(notes),
}))

export const watchProgressRelations = relations(watchProgress, ({ one }) => ({
  video: one(videos, { fields: [watchProgress.videoId], references: [videos.id] }),
  user:  one(users,  { fields: [watchProgress.userId],  references: [users.id] }),
}))

export const scheduleDaysRelations = relations(scheduleDays, ({ one }) => ({
  playlist: one(playlists, { fields: [scheduleDays.playlistId], references: [playlists.id] }),
}))

export const certificatesRelations = relations(certificates, ({ one }) => ({
  user:     one(users, { fields: [certificates.userId], references: [users.id] }),
  playlist: one(playlists, { fields: [certificates.playlistId], references: [playlists.id] }),
}))

export const notesRelations = relations(notes, ({ one }) => ({
  user:  one(users,  { fields: [notes.userId],  references: [users.id] }),
  video: one(videos, { fields: [notes.videoId], references: [videos.id] }),
}))
