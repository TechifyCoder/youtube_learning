import { neon } from '@neondatabase/serverless'

// ─────────────────────────────────────────────────────────────
// userSetup.ts — Auto-create tables in user's own Neon DB
//
// Called ONCE during onboarding when user pastes their Neon URL.
// Creates all user tables if they don't exist (idempotent).
//
// Tables created:
//   playlists, videos, watch_progress, schedule_days,
//   activity_log, quiz_attempts, coding_completions,
//   certificates, notes
//
// NOTE: Uses raw SQL (CREATE TABLE IF NOT EXISTS) instead of
// Drizzle migrations because we're setting up an arbitrary
// user-provided database URL at runtime — not at build time.
// ─────────────────────────────────────────────────────────────

const USER_DB_SETUP_SQL = `
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- playlists
CREATE TABLE IF NOT EXISTS playlists (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL,
  title                TEXT NOT NULL,
  source               TEXT NOT NULL,
  youtube_playlist_id  TEXT,
  thumbnail            TEXT,
  total_videos         INTEGER NOT NULL DEFAULT 0,
  commitment_days      INTEGER NOT NULL,
  hours_per_day        DECIMAL(4, 2),
  start_date           DATE NOT NULL,
  deadline             DATE NOT NULL,
  created_at           TIMESTAMP DEFAULT NOW() NOT NULL
);

-- videos
CREATE TABLE IF NOT EXISTS videos (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id       UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL,
  youtube_video_id  TEXT NOT NULL,
  title             TEXT NOT NULL,
  thumbnail         TEXT,
  duration_seconds  INTEGER NOT NULL,
  order_index       INTEGER NOT NULL,
  is_completed      BOOLEAN NOT NULL DEFAULT false,
  transcript        TEXT,
  created_at        TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at        TIMESTAMP DEFAULT NOW() NOT NULL
);

-- watch_progress
CREATE TABLE IF NOT EXISTS watch_progress (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id              UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  user_id               UUID NOT NULL,
  watched_segments      JSONB NOT NULL DEFAULT '[]',
  total_watched_seconds INTEGER NOT NULL DEFAULT 0,
  last_watched_at       TIMESTAMP,
  UNIQUE(video_id, user_id)
);

-- schedule_days
CREATE TABLE IF NOT EXISTS schedule_days (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id     UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  day_number      INTEGER NOT NULL,
  date            DATE NOT NULL,
  video_ids       JSONB NOT NULL,
  target_minutes  INTEGER NOT NULL,
  is_completed    BOOLEAN NOT NULL DEFAULT false,
  status          TEXT NOT NULL DEFAULT 'upcoming'
);

-- activity_log (one row per user per day)
CREATE TABLE IF NOT EXISTS activity_log (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL,
  date             DATE NOT NULL,
  minutes_watched  INTEGER NOT NULL DEFAULT 0,
  videos_watched   INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, date)
);

-- quiz_attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL,
  video_id      UUID REFERENCES videos(id) ON DELETE CASCADE,
  playlist_id   UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  quiz_type     TEXT NOT NULL,
  questions     JSONB NOT NULL,
  answers       JSONB DEFAULT '[]',
  score         INTEGER DEFAULT 0,
  max_score     INTEGER DEFAULT 100,
  is_complete   BOOLEAN DEFAULT false,
  started_at    TIMESTAMP DEFAULT NOW(),
  completed_at  TIMESTAMP
);

-- coding_completions
CREATE TABLE IF NOT EXISTS coding_completions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL,
  quiz_attempt_id  UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  question_index   INTEGER NOT NULL,
  marked_done_at   TIMESTAMP DEFAULT NOW()
);

-- certificates
CREATE TABLE IF NOT EXISTS certificates (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL,
  playlist_id  UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  issued_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  total_hours  DECIMAL(10, 2) NOT NULL,
  share_token  TEXT UNIQUE NOT NULL,
  UNIQUE(user_id, playlist_id)
);

-- notes
CREATE TABLE IF NOT EXISTS notes (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id              UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  user_id               UUID NOT NULL,
  content               TEXT NOT NULL,
  timestamp_seconds     INTEGER NOT NULL,
  end_timestamp_seconds INTEGER,
  created_at            TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_playlists_user_id ON playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_playlist_id ON videos(playlist_id);
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_progress_user_id ON watch_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_schedule_days_playlist_id ON schedule_days(playlist_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_date ON activity_log(user_id, date);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_video_id ON notes(video_id);
`

// ─────────────────────────────────────────────────────────────
// testUserDatabase
// ─────────────────────────────────────────────────────────────
// Runs a simple SELECT 1 against the user's DB URL.
// Used for the "Test Connection" button before saving.
//
// Returns: true if connection works, false if URL is invalid/unreachable

export async function testUserDatabase(databaseUrl: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
      return { success: false, error: 'URL must start with postgresql:// or postgres://' }
    }

    const sql = neon(databaseUrl)
    await sql`SELECT 1 AS test`

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    // Parse specific Neon/Postgres error messages into user-friendly ones
    if (message.includes('ECONNREFUSED') || message.includes('connection refused')) {
      return { success: false, error: 'Connection refused. Check if the URL is correct.' }
    }
    if (message.includes('authentication failed') || message.includes('password')) {
      return { success: false, error: 'Authentication failed. Make sure you copied the full connection string.' }
    }
    if (message.includes('SSL') || message.includes('ssl')) {
      return { success: false, error: 'SSL error. Add ?sslmode=require to the end of your URL.' }
    }
    if (message.includes('does not exist') || message.includes('ENOTFOUND')) {
      return { success: false, error: 'Database not found. Check the host and database name.' }
    }

    return { success: false, error: `Connection failed: ${message.slice(0, 150)}` }
  }
}

// ─────────────────────────────────────────────────────────────
// setupUserDatabase
// ─────────────────────────────────────────────────────────────
// Called ONCE during onboarding when user clicks "Setup My Database".
// Creates all required tables in the user's own Neon DB.
//
// Returns: true if successful, false if URL is invalid/unreachable

export async function setupUserDatabase(databaseUrl: string): Promise<{ success: boolean; error?: string }> {
  try {
    // First test the connection
    const test = await testUserDatabase(databaseUrl)
    if (!test.success) {
      return test
    }

    const sql = neon(databaseUrl)

    // Execute the full setup SQL (CREATE TABLE IF NOT EXISTS — safe to run multiple times)
    // Split into individual statements since Neon HTTP driver handles one at a time
    const statements = USER_DB_SETUP_SQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    for (const statement of statements) {
      try {
        await sql(statement)
      } catch (err) {
        // Log but don't fail on index creation errors (might already exist with different definition)
        const msg = err instanceof Error ? err.message : String(err)
        if (!msg.includes('already exists')) {
          throw err
        }
      }
    }

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[setupUserDatabase] Failed:', message)
    return { success: false, error: `Setup failed: ${message.slice(0, 200)}` }
  }
}
