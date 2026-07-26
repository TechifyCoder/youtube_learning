import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  date,
  jsonb,
} from 'drizzle-orm/pg-core'

// ─────────────────────────────────────────────────────────────
// PLATFORM DB SCHEMA — users table ONLY
// DATABASE: process.env.DATABASE_URL (your Neon DB)
// PURPOSE: Stores WHO is using the app, their API keys, mode.
//
// NOTHING ELSE goes in this DB.
// No playlists. No progress. No videos. Nothing.
// ─────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id:             uuid('id').primaryKey().defaultRandom(),
  email:          text('email').unique().notNull(),
  name:           text('name'),
  avatarUrl:      text('avatar_url'),

  // BYOK mode only for now
  mode:           text('mode').default('byok').notNull(),

  // User's own Neon database URL (encrypted with AES-256-CBC)
  // Field name maps to byok_database_url column — same as existing schema
  neonDatabaseUrl: text('byok_database_url'),

  // User's API keys (all encrypted with AES-256-CBC)
  youtubeApiKey:  text('youtube_api_key'),
  geminiApiKey:   text('gemini_api_key'),

  // Whether the user has completed onboarding (DB setup)
  // Field name `isDbSetup` maps to `onboarding_complete` column
  isDbSetup:      boolean('onboarding_complete').default(false).notNull(),

  // Extended profile (Phase 7)
  streakCount:    integer('streak_count').default(0).notNull(),
  longestStreak:  integer('longest_streak').default(0).notNull(),
  lastActiveDate: date('last_active_date'),
  username:       text('username').unique(),
  bio:            text('bio'),
  isPublic:       boolean('is_public').default(false).notNull(),
  settings:       jsonb('settings').default({ reminderEnabled: false, reminderTime: '09:00' }).notNull(),

  // Subscription (Phase 9)
  plan:               text('plan').default('free').notNull(),
  planExpiresAt:      timestamp('plan_expires_at'),
  razorpayCustomerId: text('razorpay_customer_id'),

  createdAt:      timestamp('created_at').defaultNow().notNull(),
})

// Export type for use across the app
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
