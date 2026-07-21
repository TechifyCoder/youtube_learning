# ARCHITECTURE.md
# LearnLoop — App Architecture, Flow & Tech Stack

**Version:** 1.0  
**Stack:** Next.js 14 · TypeScript · Tailwind CSS · Neon PostgreSQL · Drizzle ORM

---

## 1. Tech Stack

### Core Framework

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR + API routes in one project, best DX |
| Language | TypeScript | Type safety, fewer bugs, better autocomplete |
| Styling | Tailwind CSS v3 | Fast utility-first, no CSS files to manage |
| Animation | Framer Motion | Smooth glassmorphism transitions |
| UI Components | shadcn/ui | Accessible, unstyled base + Tailwind |

### Database & ORM

| Layer | Technology | Why |
|---|---|---|
| Database | Neon PostgreSQL | Serverless, free tier, no cold starts |
| ORM | Drizzle ORM | Type-safe, lightweight, great with Neon |
| Migrations | drizzle-kit | CLI-based schema migrations |

### Authentication

| Layer | Technology | Why |
|---|---|---|
| Auth | NextAuth v5 | Google OAuth, session management, easy setup |
| Provider | Google OAuth 2.0 | One-click login, no password friction |

### External APIs

| Service | Usage | Cost |
|---|---|---|
| YouTube Data API v3 | Fetch playlist, video metadata | Free — 10,000 units/day |
| YouTube IFrame Player API | Embed player, track time events | Free |
| youtube-transcript (npm) | Fetch video subtitles | Free (unofficial) |
| Anthropic Claude API (`claude-sonnet-4-6`) | Transcript Q&A | Pay per use |

### Key Libraries

```
framer-motion        → Page transitions, card animations
lucide-react         → Icons
clsx + tailwind-merge → Conditional class merging (cn() utility)
date-fns             → Schedule date calculations
react-hook-form      → Form state management
zod                  → Input validation schemas
react-hot-toast      → Toast notifications
@anthropic-ai/sdk    → Claude API (streaming)
```

### Deployment

| Service | Purpose | Cost |
|---|---|---|
| Vercel | Next.js hosting, CI/CD | Free tier |
| Neon | PostgreSQL database | Free (0.5 GB) |
| GitHub | Version control | Free |

---

## 2. Application Flow

### 2.1 Authentication Flow

```
User visits LearnLoop
        ↓
Not logged in → redirect to /login
        ↓
User clicks "Continue with Google"
        ↓
NextAuth → Google OAuth consent screen
        ↓
Google returns token → NextAuth creates session
        ↓
User record created/updated in `users` table
        ↓
Redirect to /dashboard
```

### 2.2 Import Playlist Flow

```
User on /import page
        ↓
Pastes YouTube URL → clicks Import
        ↓
Frontend calls GET /api/youtube/playlist?url=...
        ↓
API validates URL → extracts playlist ID
        ↓
Calls YouTube Data API v3:
  → playlistItems.list (get all video IDs)
  → videos.list (get titles, durations, thumbnails)
        ↓
Returns structured data to frontend
        ↓
Frontend shows PlaylistPreview card
        ↓
User sets commitment days → schedule preview updates live
        ↓
User clicks "Add to My Courses"
        ↓
POST /api/playlists → saves to DB:
  → playlists table (one row)
  → videos table (one row per video)
        ↓
POST /api/schedule/generate → creates schedule_days rows
        ↓
Redirect to /playlist/[id]
```

### 2.3 Video Watching Flow

```
User on /watch/[videoId]
        ↓
Page loads → GET /api/progress?videoId=xxx
  → fetch existing watched_segments from DB
        ↓
YouTubePlayer component mounts
  → IFrame Player API loads
  → onReady: seekTo(lastWatchedPosition)
        ↓
User presses play
  → onStateChange fires (state = PLAYING)
  → setInterval starts (every 5 seconds)
  → every tick: push {start, currentTime} to segments buffer
        ↓
User pauses / video ends
  → onStateChange fires (PAUSED / ENDED)
  → segment finalized: {start: x, end: currentTime}
  → mergeSegments() → combine overlapping segments
  → POST /api/progress → upsert to watch_progress table
        ↓
ProgressBar component re-renders
  → calculate % of video covered by green segments
  → render red/green div slices
        ↓
If total_watched >= 90% of duration:
  → mark video is_completed = true
  → update playlist completion count
  → check if schedule day is complete
```

### 2.4 AI Q&A Flow

```
User on /watch/[videoId] → opens chat panel
        ↓
On video load: GET /api/transcript?videoId=xxx
  → check DB for cached transcript
  → if not cached: youtube-transcript package fetches it
  → clean and store in DB
  → return to frontend
        ↓
User types question → clicks Send
        ↓
POST /api/ai/chat
  body: { videoId, question, transcript }
        ↓
API route builds Claude prompt:
  system: "You are a helpful tutor. Answer based only on this transcript."
  user: "[transcript text]\n\nQuestion: [user question]"
        ↓
Anthropic SDK streams response
  → ReadableStream sent back to frontend
        ↓
Frontend reads stream chunks → appends to chat message word by word
        ↓
Chat history stored in React state (not DB)
```

### 2.5 Schedule Generation Flow

```
Input: videos[], commitment_days, start_date
        ↓
Calculate target_seconds_per_day:
  total_duration_seconds / commitment_days
        ↓
For each video:
  if duration > 7200s (2hrs):
    split into parts of size ≈ target_seconds_per_day
  else:
    keep as single unit
        ↓
Distribute units across days:
  fill each day until target reached
  if unit doesn't fit: start new day
        ↓
Assign calendar dates (start_date + day_number)
        ↓
Save schedule_days rows to DB
  each row: { playlist_id, day_number, date, video_ids[], target_minutes }
```

---

## 3. Folder & File Structure

```
learnloop/
│
├── app/                                ← Next.js App Router
│   │
│   ├── (auth)/                         ← Auth route group (no sidebar layout)
│   │   └── login/
│   │       └── page.tsx                ← Google login page
│   │
│   ├── (dashboard)/                    ← Protected route group (with sidebar)
│   │   ├── layout.tsx                  ← Sidebar + Navbar wrapper
│   │   ├── dashboard/
│   │   │   └── page.tsx                ← Home: courses, today's target, stats
│   │   ├── import/
│   │   │   └── page.tsx                ← Import YouTube URL or build custom playlist
│   │   ├── playlist/
│   │   │   └── [id]/
│   │   │       └── page.tsx            ← Playlist detail: videos list + schedule calendar
│   │   ├── watch/
│   │   │   └── [videoId]/
│   │   │       └── page.tsx            ← Video player + progress bar + AI chat panel
│   │   └── custom/
│   │       └── page.tsx                ← Custom playlist builder (multi-URL input)
│   │
│   ├── api/                            ← API Routes (all server-side)
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts            ← NextAuth handler (Google OAuth)
│   │   ├── youtube/
│   │   │   ├── playlist/
│   │   │   │   └── route.ts            ← GET: fetch YT playlist data
│   │   │   └── video/
│   │   │       └── route.ts            ← GET: fetch single video info
│   │   ├── transcript/
│   │   │   └── route.ts                ← GET: fetch + cache transcript
│   │   ├── ai/
│   │   │   └── chat/
│   │   │       └── route.ts            ← POST: Claude Q&A with streaming
│   │   ├── playlists/
│   │   │   ├── route.ts                ← GET (list), POST (create)
│   │   │   └── [id]/
│   │   │       └── route.ts            ← GET (detail), DELETE
│   │   ├── progress/
│   │   │   └── route.ts                ← GET (fetch), POST (upsert segments)
│   │   └── schedule/
│   │       ├── generate/
│   │       │   └── route.ts            ← POST: generate schedule from commitment
│   │       └── [dayId]/
│   │           └── route.ts            ← PATCH: mark day complete
│   │
│   ├── globals.css                     ← Tailwind base, CSS variables
│   └── layout.tsx                      ← Root layout: fonts, providers, metadata
│
├── components/
│   │
│   ├── ui/                             ← shadcn/ui generated components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   └── skeleton.tsx
│   │
│   ├── layout/
│   │   ├── Navbar.tsx                  ← Top bar: logo, user avatar, logout
│   │   ├── Sidebar.tsx                 ← Left nav: Dashboard, Import, links
│   │   └── PageWrapper.tsx             ← Page padding + max-width container
│   │
│   ├── dashboard/
│   │   ├── CourseCard.tsx              ← Card with thumbnail, progress bar, badge
│   │   ├── StatsRow.tsx                ← Total hours, active courses, completion %
│   │   └── TodayTarget.tsx             ← "Watch 58min today — Video 3" widget
│   │
│   ├── player/
│   │   ├── YouTubePlayer.tsx           ← IFrame Player API wrapper component
│   │   ├── ProgressBar.tsx             ← Red/green segmented bar component
│   │   ├── VideoParts.tsx              ← Parts list for split long videos
│   │   └── TranscriptChat.tsx          ← AI Q&A side panel with chat UI
│   │
│   ├── import/
│   │   ├── URLImport.tsx               ← URL paste input + Import button
│   │   ├── PlaylistPreview.tsx         ← Fetched playlist preview card
│   │   ├── CommitmentForm.tsx          ← "Finish in X days" input + schedule preview
│   │   └── MultiVideoInput.tsx         ← Add videos one by one for custom playlist
│   │
│   ├── playlist/
│   │   ├── VideoListItem.tsx           ← Single video row: thumb, title, status
│   │   ├── ScheduleCalendar.tsx        ← Day-by-day schedule view
│   │   └── ScheduleDayCard.tsx         ← Single day card: videos, target, status badge
│   │
│   └── common/
│       ├── GlassCard.tsx               ← Reusable frosted glass card wrapper
│       ├── Badge.tsx                   ← On Track / Behind / Upcoming status pills
│       ├── LoadingSpinner.tsx          ← Centered spinner
│       └── EmptyState.tsx              ← Illustrated empty state with CTA
│
├── lib/
│   │
│   ├── db/
│   │   ├── schema.ts                   ← Drizzle table definitions (all 5 tables)
│   │   ├── index.ts                    ← Neon + Drizzle client (singleton)
│   │   └── migrations/                 ← Auto-generated by drizzle-kit
│   │
│   ├── youtube.ts                      ← YouTube API helper functions
│   │                                     fetchPlaylist(url)
│   │                                     fetchVideoDetails(videoId)
│   │                                     parseYouTubeUrl(url) → {type, id}
│   │
│   ├── transcript.ts                   ← Transcript fetch + clean text
│   │                                     fetchTranscript(videoId)
│   │                                     cleanTranscript(raw) → string
│   │
│   ├── claude.ts                       ← Anthropic SDK wrapper
│   │                                     streamAnswer(transcript, question)
│   │
│   ├── schedule.ts                     ← Schedule generation logic
│   │                                     generateSchedule(videos, days, startDate)
│   │                                     splitLongVideo(video, targetSeconds)
│   │                                     mergeSegments(segments[]) → merged[]
│   │                                     calculateProgress(segments, duration) → %
│   │
│   └── utils.ts                        ← Shared utilities
│                                         cn(...classes) → string
│                                         formatDuration(seconds) → "1h 23min"
│                                         formatDate(date) → "Jul 17"
│
├── hooks/
│   ├── useYouTubePlayer.ts             ← Player state, events, time tracking
│   ├── useWatchProgress.ts             ← Segment state, save/load, merge logic
│   └── useSchedule.ts                  ← Schedule fetch, day status calculation
│
├── types/
│   └── index.ts                        ← All TypeScript interfaces
│                                         User, Playlist, Video, WatchProgress
│                                         Segment, ScheduleDay, TranscriptLine
│
├── constants/
│   └── index.ts                        ← App-wide constants
│                                         SPLIT_THRESHOLD_SECONDS = 7200
│                                         MIN_PART_SECONDS = 1200
│                                         COMPLETION_THRESHOLD = 0.9
│                                         PROGRESS_SAVE_INTERVAL = 5000
│                                         MAX_AI_QUESTIONS = 10
│
├── public/
│   ├── favicon.ico
│   └── og-image.png                    ← Open Graph image for link previews
│
├── .env.local                          ← Secret keys (never commit)
├── .env.example                        ← Template with placeholder values
├── drizzle.config.ts                   ← Drizzle kit config (DB connection)
├── next.config.ts                      ← Next.js config
├── tailwind.config.ts                  ← Tailwind + custom design tokens
├── tsconfig.json
└── README.md
```

---

## 4. Database Schema

### Table: `users`

```sql
id          uuid        PRIMARY KEY DEFAULT gen_random_uuid()
email       text        UNIQUE NOT NULL
name        text
avatar_url  text
created_at  timestamp   DEFAULT now()
```

### Table: `playlists`

```sql
id                    uuid      PRIMARY KEY DEFAULT gen_random_uuid()
user_id               uuid      REFERENCES users(id) ON DELETE CASCADE
title                 text      NOT NULL
source                text      NOT NULL  -- 'youtube' | 'custom'
youtube_playlist_id   text                -- null for custom playlists
thumbnail             text
total_videos          integer   DEFAULT 0
commitment_days       integer   NOT NULL
hours_per_day         decimal
start_date            date      NOT NULL
deadline              date      NOT NULL  -- start_date + commitment_days
created_at            timestamp DEFAULT now()
```

### Table: `videos`

```sql
id                uuid      PRIMARY KEY DEFAULT gen_random_uuid()
playlist_id       uuid      REFERENCES playlists(id) ON DELETE CASCADE
user_id           uuid      REFERENCES users(id) ON DELETE CASCADE
youtube_video_id  text      NOT NULL
title             text      NOT NULL
thumbnail         text
duration_seconds  integer   NOT NULL
order_index       integer   NOT NULL
is_completed      boolean   DEFAULT false
created_at        timestamp DEFAULT now()
```

### Table: `watch_progress`

```sql
id                      uuid      PRIMARY KEY DEFAULT gen_random_uuid()
video_id                uuid      REFERENCES videos(id) ON DELETE CASCADE
user_id                 uuid      REFERENCES users(id) ON DELETE CASCADE
watched_segments        jsonb     DEFAULT '[]'
-- Format: [{"start": 60, "end": 1200}, {"start": 1500, "end": 2100}]
total_watched_seconds   integer   DEFAULT 0
last_watched_at         timestamp
UNIQUE(video_id, user_id)        -- one progress row per user per video
```

### Table: `schedule_days`

```sql
id              uuid      PRIMARY KEY DEFAULT gen_random_uuid()
playlist_id     uuid      REFERENCES playlists(id) ON DELETE CASCADE
day_number      integer   NOT NULL
date            date      NOT NULL
video_ids       jsonb     NOT NULL
-- Format: ["uuid1", "uuid2"] — may include part references
target_minutes  integer   NOT NULL
is_completed    boolean   DEFAULT false
status          text      DEFAULT 'upcoming'
-- 'upcoming' | 'on_track' | 'behind' | 'completed'
```

---

## 5. API Response Contracts

### GET `/api/youtube/playlist?url=...`

```typescript
// Success
{
  playlistId: string
  title: string
  thumbnail: string
  videos: Array<{
    youtubeVideoId: string
    title: string
    thumbnail: string
    durationSeconds: number
    orderIndex: number
  }>
  totalDurationSeconds: number
  videoCount: number
}

// Error
{ error: string, code: 'INVALID_URL' | 'QUOTA_EXCEEDED' | 'NOT_FOUND' | 'PRIVATE' }
```

### POST `/api/progress`

```typescript
// Request body
{
  videoId: string
  segments: Array<{ start: number, end: number }>
}

// Response
{
  totalWatchedSeconds: number
  completionPercent: number
  isCompleted: boolean
}
```

### POST `/api/ai/chat` (streaming)

```typescript
// Request body
{
  videoId: string
  question: string
  transcript: string
}

// Response: ReadableStream (text/event-stream)
// Chunks: "data: {text}\n\n"
// Final: "data: [DONE]\n\n"
```

---

## 6. Key Design Decisions

### Why Neon over Supabase?

Supabase gives only 2 free projects. Satish has already used both. Neon gives a fresh free PostgreSQL database with 0.5GB storage and no project limits on the free tier. Drizzle ORM works perfectly with Neon's serverless driver.

### Why Drizzle over Prisma?

Drizzle is lighter, faster cold starts (important for Vercel serverless), and has excellent TypeScript inference. Prisma is great but heavier for a solo project.

### Why not use YouTube's embed directly?

The YouTube IFrame Player API is required (not just a plain `<iframe>`) because we need JavaScript access to `player.getCurrentTime()`, `player.getDuration()`, and event callbacks like `onStateChange`. A plain iframe doesn't expose these.

### Why store segments as JSONB instead of a separate table?

A separate `watched_seconds` table with one row per second would be impractical. JSONB segments are compact (a 2-hour video needs at most a few dozen segment objects), queryable, and fast to upsert.

### Why ReadableStream for AI chat?

Streaming the Claude response word-by-word gives instant feedback — the user sees the answer forming rather than waiting 5–10 seconds for a full response. This dramatically improves the perceived quality of the AI feature.
