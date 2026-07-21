# MEMORY.md
# LearnLoop — Project Memory & Context

**Purpose:** This file gives any AI assistant (Claude, Cursor, Gemini, GPT, etc.) full context about this project. Read this file at the start of every session before writing any code.

**Last Updated:** 2026-07-19
**Current Phase:** Phase 6 — Complete (Phase 1, 2, 3, 4, 5 complete)  
**Production URL:** Not deployed yet

---

## Project in One Paragraph

LearnLoop is a web app that lets users import YouTube playlists (or create custom ones), set a commitment deadline ("I'll finish this in 10 days"), and watch videos with a red/green progress bar that tracks exactly which seconds were watched. The app auto-generates a day-by-day schedule, splits long videos into parts, and lets users ask AI questions about video content using the transcript. Stack: Next.js 14, TypeScript, Tailwind CSS, Neon PostgreSQL, Drizzle ORM, NextAuth (Google), YouTube Data API v3, Anthropic Claude API.

---

## Development Phases

- **Phase 1:** ✅ Initial Setup & Database (Complete)
- **Phase 2:** ✅ Auth & Custom YouTube Search (Complete)
- **Phase 3:** ✅ Video Player & Progress Tracking (Complete)
- **Phase 4:** ✅ Schedule System & Commitments (Complete)
- **Phase 5:** ✅ AI Q&A + Transcript (Complete)
- **Phase 6:** ✅ Streak System + Activity Heatmap (Complete)
- **Phase 7:** ✅ Completion Certificate + Public Profile (Complete)
- **Phase 8:** ⏳ Sidebar Expansion + PWA

## Major Decisions & Schema Changes

### Phase 1–5 History
- Used Neon serverless Postgres (`drizzle-orm`). Downgraded `@neondatabase/serverless` to `0.9.5` to avoid `sql` tagged template issues with older drizzle versions.
- Kept UI strictly dark mode with Framer Motion animations.
- Implemented `watch_progress` jsonb for tracking watched video chunks.

### Phase 6 Updates
- Added `streak_count`, `longest_streak`, `last_active_date` to `users` table.
- Added new `activity_log` table to track daily minutes and videos watched for the Heatmap.

### Phase 7 Updates
- Added `username` (unique), `bio`, `is_public` columns to `users` table.
- Added `certificates` table to store course completion records and share tokens.

---

## Developer Context

- **Developer:** Satish
- **Location:** Indore, Madhya Pradesh, India
- **Background:** Freelance web designer, MERN stack experience, Next.js familiar
- **Studio:** Webify
- **Daily time available:** 4–5 hours
- **Target launch:** 15–18 days from project start

---

## Key Technical Decisions (Do Not Change Without Noting Here)

| Decision | Choice | Why |
|---|---|---|
| Database | Neon PostgreSQL | Supabase free slots already used up (2/2) |
| ORM | Drizzle ORM | Lighter than Prisma, great with Neon serverless |
| Auth | NextAuth v5 (Beta) | Google OAuth, simplest setup for Next.js |
| AI Model | claude-sonnet-4-6 | Best balance of speed/quality/cost |
| Styling | Tailwind CSS v3 | Not v4 — shadcn/ui compatibility |
| UI Components | shadcn/ui | Accessible, unstyled base |
| Animations | Framer Motion | Not GSAP — simpler for React |
| Icons | lucide-react | Consistent set, tree-shakable |
| YouTube embed | IFrame Player API | Need JS access to getCurrentTime() |
| Transcript | youtube-transcript npm | Unofficial but reliable, free |

---

## What Has Been Built

Update this section at the end of every development session.

### Phase 1 — Foundation
- [x] Project created (manually — create-next-app blocked by OneDrive ACL, all files written manually)
- [ ] All dependencies installed (`npm install` pending — run after reading this)
- [x] shadcn/ui components created manually (button, input, skeleton)
- [x] Folder structure created (complete per ARCHITECTURE.md Section 3)
- [x] tailwind.config.ts with design tokens from DESIGN.md
- [x] globals.css with all CSS variables from DESIGN.md
- [ ] Neon database connected (need DATABASE_URL in .env.local)
- [x] Drizzle schema created (5 tables: users, playlists, videos, watch_progress, schedule_days)
- [ ] Migrations run — tables exist in DB (run: npm run db:migrate after setting DATABASE_URL)
- [ ] NextAuth + Google OAuth working (need GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET in .env.local)
- [x] Login page built (glassmorphism, Google OAuth button, feature bullets)
- [x] Dashboard layout with sidebar (Sidebar.tsx, mobile nav, orb background)
- [x] Middleware protecting routes (/login redirect for unauthenticated)
- [x] GlassCard, Badge, EmptyState, LoadingSpinner components
- [x] lib/utils.ts with cn(), formatDuration(), formatDate(), formatTimestamp(), formatPercent()
- [x] types/index.ts with all interfaces
- [x] constants/index.ts

### Phase 2 — YouTube Import + Playlists
- [x] lib/youtube.ts (parseYouTubeUrl, fetchPlaylist, fetchVideoDetails)
- [x] app/api/youtube/playlist/route.ts
- [x] app/api/youtube/video/route.ts
- [x] components/import/URLImport.tsx
- [x] components/import/PlaylistPreview.tsx
- [x] components/import/CommitmentForm.tsx
- [x] app/(dashboard)/import/page.tsx
- [x] components/import/MultiVideoInput.tsx
- [x] app/(dashboard)/custom/page.tsx
- [x] app/api/playlists/route.ts (POST, GET)
- [x] app/api/playlists/[id]/route.ts (GET, DELETE)
- [x] components/playlist/VideoListItem.tsx
- [x] app/(dashboard)/playlist/[id]/page.tsx
- [x] components/dashboard/CourseCard.tsx
- [x] components/dashboard/StatsRow.tsx
- [x] Dashboard page updated to fetch DB playlists

### Phase 3 — Video Player + Progress
- [x] hooks/useYouTubePlayer.ts
- [x] components/player/YouTubePlayer.tsx
- [x] app/(dashboard)/watch/[videoId]/page.tsx
- [x] lib/schedule.ts (progress logic)
- [x] hooks/useWatchProgress.ts
- [x] /api/progress route
- [x] components/player/ProgressBar.tsx
- [x] components/player/VideoParts.tsx
- [x] Resume logic & completion flow

### Phase 4 — Schedule System
- [x] lib/schedule.ts — generateSchedule() function complete
- [x] /api/schedule/generate route
- [x] Schedule generation wired into import flow
- [x] /api/schedule/[dayId] PATCH route
- [x] ScheduleCalendar component
- [x] ScheduleDayCard component
- [x] hooks/useSchedule.ts
- [x] TodayTarget widget on dashboard
- [x] StatsRow with real data
- [x] CourseCard with real schedule data + badges
- [x] Deadline display on playlist page

### Phase 5 — AI + Polish + Deploy
- [ ] lib/transcript.ts (fetchTranscript, cleanTranscript, prepareTranscriptForAI)
- [ ] /api/transcript route (with DB caching)
- [ ] lib/claude.ts (streamAnswer)
- [ ] /api/ai/chat route (streaming)
- [ ] TranscriptChat component
- [ ] lib/animations.ts with Framer Motion presets
- [ ] All Framer Motion animations added
- [ ] All loading skeletons
- [ ] All empty states polished
- [ ] Mobile responsive pass complete
- [ ] Deployed to Vercel
- [ ] Production environment variables set
- [ ] Google OAuth redirect URI updated for production
- [ ] README.md written

---

## Current Bugs / Issues

*Update this section when bugs are found. Remove when fixed.*

| Bug | Where | Status |
|---|---|---|
| (none yet) | — | — |

---

## Files That Exist

*Update this when new files are created. Helps avoid recreating existing files.*

```
# Config
package.json
tsconfig.json
tailwind.config.ts
postcss.config.js
next.config.ts
drizzle.config.ts
components.json
next-env.d.ts
.env.example          ← copy to .env.local and fill in keys
.gitignore

# App
app/globals.css        ← all CSS variables from DESIGN.md
app/layout.tsx         ← root layout, Syne+DM Sans+JetBrains Mono fonts
app/page.tsx           ← redirects to /dashboard
app/(auth)/login/page.tsx
app/(dashboard)/layout.tsx
app/(dashboard)/dashboard/page.tsx
app/(dashboard)/import/page.tsx      ← placeholder
app/(dashboard)/custom/page.tsx      ← placeholder
app/(dashboard)/playlist/[id]/page.tsx  ← placeholder
app/(dashboard)/watch/[videoId]/page.tsx  ← placeholder
app/api/auth/[...nextauth]/route.ts
app/api/youtube/playlist/route.ts    ← placeholder

# Components
components/layout/Sidebar.tsx
components/layout/PageWrapper.tsx
components/common/GlassCard.tsx
components/common/Badge.tsx
components/common/EmptyState.tsx
components/common/LoadingSpinner.tsx
components/ui/button.tsx
components/ui/input.tsx
components/ui/skeleton.tsx

# Lib
lib/auth.ts
lib/animations.ts
lib/utils.ts
lib/schedule.ts       ← placeholder
lib/youtube.ts        ← placeholder
lib/transcript.ts     ← placeholder
lib/claude.ts         ← placeholder
lib/db/index.ts
lib/db/schema.ts

# Hooks (placeholders)
hooks/useYouTubePlayer.ts
hooks/useWatchProgress.ts
hooks/useSchedule.ts

# Types / Constants
types/index.ts
constants/index.ts
```

---

## Environment Variables Status

| Variable | Status |
|---|---|
| DATABASE_URL | ⬜ Not set |
| DATABASE_URL_UNPOOLED | ⬜ Not set |
| NEXTAUTH_SECRET | ⬜ Not set |
| NEXTAUTH_URL | ⬜ Not set |
| GOOGLE_CLIENT_ID | ⬜ Not set |
| GOOGLE_CLIENT_SECRET | ⬜ Not set |
| YOUTUBE_API_KEY | ⬜ Not set |
| ANTHROPIC_API_KEY | ⬜ Not set |
| NEXT_PUBLIC_APP_URL | ⬜ Not set |

Update to ✅ when each key is added to .env.local.

---

## API Keys — Where to Get Them

| Key | Where to Get |
|---|---|
| DATABASE_URL | neon.tech → your project → Connection Details → Pooled connection |
| DATABASE_URL_UNPOOLED | neon.tech → your project → Connection Details → Direct connection |
| NEXTAUTH_SECRET | Run: `openssl rand -base64 32` in terminal |
| GOOGLE_CLIENT_ID + SECRET | console.cloud.google.com → APIs → Credentials → OAuth 2.0 |
| YOUTUBE_API_KEY | console.cloud.google.com → APIs → Enable YouTube Data API v3 → Create API key |
| ANTHROPIC_API_KEY | console.anthropic.com → API Keys |

---

## Important Constraints to Remember

1. **Never use `any` TypeScript type** — fix the actual type error
2. **All API routes need auth check** — always verify session before DB query
3. **Never trust client-sent userId** — always use `session.user.id`
4. **YouTube quota = 10,000 units/day** — do not use `search.list` (costs 100 units)
5. **Segments must be merged** before saving to DB and before rendering progress bar
6. **Video is complete at 90%** not 100% (constant: `COMPLETION_THRESHOLD = 0.9`)
7. **Claude API server-side only** — never in 'use client' components
8. **Tailwind v3** — not v4, shadcn/ui requires v3
9. **NextAuth v5** is beta — import patterns differ from v4 (use `auth()` not `getServerSession()`)
10. **Progress saves on: pause, end, beforeunload, next-video click** — all four triggers

---

## Decisions Made During Development

*Add entries here whenever a significant technical decision is made mid-development.*

| Date | Decision | Reason |
|---|---|---|
| (none yet) | — | — |

---

## Session Log

*Brief note at the end of each session. What was done, what's next.*

| Date | What Was Done | Next Session |
|---|---|---|
| 2026-07-18 | Phase 1 Day 1 complete: all files scaffolded manually (Next.js 14 config, all 5 DB tables, auth, login page, dashboard layout, sidebar, all common components, types, constants, utils, design tokens) | Run `npm install`, create `.env.local` from `.env.example`, fill in DB + Google OAuth + YouTube API keys, run `npm run db:migrate`, then start Day 2 tasks |

---

## How to Resume After a Break

When starting a new session (with any AI):

1. Give the AI this file first: "Read this MEMORY.md for project context"
2. Then give: PRD.md, ARCHITECTURE.md, RULES.md, PHASES.md, DESIGN.md
3. Say: "We are on Phase X. The last thing built was Y. Continue from there."
4. AI should confirm what it understands before writing any code
5. After the session, update the "What Has Been Built" checklist and "Session Log"

---

## Project File Locations

```
Root docs (read before any session):
  PRD.md          → What to build, features, target users
  ARCHITECTURE.md → Tech stack, app flow, folder structure, DB schema
  RULES.md        → What to use/avoid, code patterns, error handling
  PHASES.md       → Phase-by-phase build plan with done criteria
  DESIGN.md       → Colors, typography, glassmorphism, component patterns
  MEMORY.md       → THIS FILE — current state of the project

Source code:
  app/            → Next.js pages and API routes
  components/     → React components
  lib/            → Business logic, DB, API helpers
  hooks/          → Custom React hooks
  types/          → TypeScript interfaces
  constants/      → App-wide constants
```
