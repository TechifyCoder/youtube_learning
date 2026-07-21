# PHASES.md
# LearnLoop — Phased Development Plan

**Version:** 2.0  
**Total Phases:** 8  
**Estimated Time:** 25–30 days at 4–5 hours/day

---

## How to Use This File

This file tells the AI (Claude Code or any other AI) exactly what to build in each phase — and what NOT to touch yet. Each phase is self-contained and produces a working, runnable app at the end. Never jump ahead to the next phase until the current one is complete and tested.

**Rule for AI:** At the start of every session, read PRD.md, ARCHITECTURE.md, RULES.md, and this file. Then ask "Which phase are we on?" before writing any code.

---

## Phase Overview

```
Phase 1 (Days 1–3)   → Project foundation, auth, layout, DB
Phase 2 (Days 4–6)   → YouTube import + playlist system
Phase 3 (Days 7–10)  → Video player + red/green progress tracking
Phase 4 (Days 11–13) → Schedule system + commitment feature
Phase 5 (Days 14–16) → AI Q&A + polish + deploy
Phase 6 (Days 17–20) → Streak system + activity heatmap
Phase 7 (Days 21–24) → Completion certificate + public profile
Phase 8 (Days 25–28) → Sidebar expansion + final polish + PWA
```

---

## Phase 1 — Foundation
**Days 1–3 · Goal: App runs, user can log in, DB is ready**

### What to Build

#### Day 1 — Project Setup
```
1. Create Next.js 14 project:
   npx create-next-app@latest learnloop --typescript --tailwind --app --src-dir=false --import-alias="@/*"

2. Install all dependencies (install everything at once):
   npm install framer-motion lucide-react clsx tailwind-merge date-fns react-hot-toast
   npm install react-hook-form zod
   npm install @neondatabase/serverless drizzle-orm
   npm install next-auth@beta @auth/core
   npm install @anthropic-ai/sdk
   npm install youtube-transcript
   npm install -D drizzle-kit

3. Setup shadcn/ui:
   npx shadcn@latest init
   npx shadcn@latest add button input dialog skeleton badge

4. Create complete folder structure (all folders + empty index files)
   Refer to ARCHITECTURE.md Section 3 for exact structure

5. Create .env.local from .env.example
   Add all placeholder values

6. Create tailwind.config.ts with custom design tokens from DESIGN.md

7. Create globals.css with CSS variables from DESIGN.md

8. Setup Google Cloud Console:
   - Create project
   - Enable YouTube Data API v3
   - Create OAuth 2.0 credentials
   - Copy keys to .env.local
```

#### Day 2 — Database + Auth
```
1. Create lib/db/schema.ts with all 5 tables:
   - users
   - playlists
   - videos
   - watch_progress
   - schedule_days
   (Exact schema in ARCHITECTURE.md Section 4)

2. Create lib/db/index.ts — Neon + Drizzle client

3. Create drizzle.config.ts

4. Run: npx drizzle-kit generate
   Run: npx drizzle-kit migrate
   Verify tables in Neon console

5. Setup NextAuth v5:
   - Create lib/auth.ts with Google provider
   - Create app/api/auth/[...nextauth]/route.ts
   - Add NEXTAUTH_SECRET + NEXTAUTH_URL to .env.local

6. Create middleware.ts for protected routes
   (all /dashboard/* routes require auth)

7. Create app/(auth)/login/page.tsx
   - Glassmorphism card centered on dark background
   - "Continue with Google" button
   - LearnLoop logo + tagline
```

#### Day 3 — Layout + Navigation
```
1. Create app/(dashboard)/layout.tsx
   - Sidebar (desktop) + bottom nav (mobile)
   - Auth session check

2. Create components/layout/Sidebar.tsx
   - Logo at top
   - Nav links: Dashboard, Import, Custom Playlist
   - User avatar + name at bottom
   - Active link highlight

3. Create components/layout/Navbar.tsx
   - Mobile only top bar
   - Logo + hamburger menu

4. Create components/layout/PageWrapper.tsx
   - Max width container
   - Consistent padding

5. Create app/(dashboard)/dashboard/page.tsx
   - Empty state placeholder (no courses yet)
   - "Import your first course →" CTA button

6. Create components/common/GlassCard.tsx
7. Create components/common/Badge.tsx
8. Create components/common/EmptyState.tsx
9. Create components/common/LoadingSpinner.tsx

10. Create lib/utils.ts with:
    - cn() utility function
    - formatDuration(seconds) → "1h 23min"
    - formatDate(date) → "Jul 17"
    - formatPercent(n) → "42%"

11. Create types/index.ts with all interfaces
12. Create constants/index.ts with all constants
```

### Phase 1 Done Criteria

- [ ] `npm run dev` starts with zero errors
- [ ] Visiting `/` redirects to `/login`
- [ ] Google login works → redirected to `/dashboard`
- [ ] `/dashboard` shows empty state with sidebar visible
- [ ] Sidebar links navigate between pages (empty pages are fine)
- [ ] Neon DB has all 5 tables (verify in Neon console)
- [ ] Mobile layout works (hamburger menu visible on small screen)
- [ ] No TypeScript errors (`npm run build` passes)

### What NOT to Build in Phase 1

- YouTube API calls
- Video player
- Progress bars
- Schedule system
- AI features

---

## Phase 2 — YouTube Import + Playlist System
**Days 4–6 · Goal: User can import a YouTube playlist and see it in the app**

### What to Build

#### Day 4 — YouTube API Layer
```
1. Create lib/youtube.ts with these functions:
   - parseYouTubeUrl(url) → { type: 'playlist'|'video'|'invalid', id: string }
   - fetchPlaylist(playlistId) → playlist + videos array
   - fetchVideoDetails(videoId) → single video info
   - Handle all error cases (private, quota, not found, invalid)

2. Create app/api/youtube/playlist/route.ts
   - GET handler with url param
   - Validate with Zod
   - Call lib/youtube.ts
   - Return structured response (see ARCHITECTURE.md Section 5)

3. Create app/api/youtube/video/route.ts
   - GET handler with videoId param
   - For single video URL imports

4. Test with Postman or Thunder Client:
   - Valid playlist URL → returns all videos
   - Private playlist → returns proper error
   - Invalid URL → returns INVALID_URL error
   - Quota check (do not exhaust quota in testing)
```

#### Day 5 — Import Page UI
```
1. Create app/(dashboard)/import/page.tsx
   - Two tabs: "YouTube Link" and "Multiple Videos"
   - Default: YouTube Link tab active

2. Create components/import/URLImport.tsx
   - URL input with paste button
   - Import button with loading state
   - Error display below input

3. Create components/import/PlaylistPreview.tsx
   - Shows after successful fetch
   - Thumbnail, title, video count, total duration
   - Animated slide-in with Framer Motion

4. Create components/import/CommitmentForm.tsx
   - "Finish in X days" number input
   - Start date (default today)
   - Live schedule preview (updates on input change)
   - Calculation: totalDuration / days = minutes/day

5. Create app/api/playlists/route.ts
   - POST: create playlist + videos in DB
   - GET: fetch all playlists for current user

6. Create app/api/playlists/[id]/route.ts
   - GET: playlist detail with videos
   - DELETE: remove playlist

7. On successful save → redirect to /playlist/[id]
```

#### Day 6 — Custom Playlist + Playlist Detail Page
```
1. Create components/import/MultiVideoInput.tsx
   - Paste URL → fetches video info → adds to list
   - Remove video from list (× button)
   - Reorder with up/down arrow buttons
   - Playlist name input
   - Commitment days input
   - "Create Playlist" button

2. Create app/(dashboard)/custom/page.tsx
   - Uses MultiVideoInput component
   - Same save flow as YouTube import

3. Create app/(dashboard)/playlist/[id]/page.tsx
   - Playlist header: thumbnail, title, source badge, deadline
   - Overall progress bar (red/green)
   - Video list with VideoListItem components

4. Create components/playlist/VideoListItem.tsx
   - Video thumbnail (50×36px)
   - Title + duration
   - Completion status icon (check or empty circle)
   - Click → navigate to /watch/[videoId]

5. Update dashboard page:
   - Fetch playlists from /api/playlists
   - Show CourseCard for each playlist
   - Create components/dashboard/CourseCard.tsx
     (thumbnail, title, badge, basic progress bar — static for now)
   - Create components/dashboard/StatsRow.tsx
     (total hours, active courses — static for now)
```

### Phase 2 Done Criteria

- [ ] User can paste a YouTube playlist URL and see all videos fetched
- [ ] User can paste a single YouTube video URL
- [ ] PlaylistPreview shows correct video count and total duration
- [ ] CommitmentForm calculates minutes/day correctly
- [ ] "Add to My Courses" saves to DB (verify in Neon console)
- [ ] Dashboard shows imported playlists as cards
- [ ] Playlist detail page shows all videos in order
- [ ] Custom playlist builder adds/removes/reorders videos
- [ ] Error states handled: invalid URL, private playlist, quota exceeded
- [ ] Loading states on all async buttons

### What NOT to Build in Phase 2

- Video player (player page can be a placeholder)
- Actual red/green progress tracking
- Schedule generation (commitment form collects data but does not generate schedule yet)
- AI features

---

## Phase 3 — Video Player + Progress Tracking
**Days 7–10 · Goal: User can watch videos with real-time red/green progress tracking**

### What to Build

#### Day 7 — YouTube IFrame Player
```
1. Create hooks/useYouTubePlayer.ts
   - Load YouTube IFrame API via script tag (if not already loaded)
   - Initialize player with videoId
   - Expose: play(), pause(), seekTo(seconds), getCurrentTime(), getDuration()
   - Expose event callbacks: onReady, onStateChange, onEnded
   - Cleanup: destroy player on unmount

2. Create components/player/YouTubePlayer.tsx
   - Renders div container for IFrame API to mount into
   - Accepts videoId, startTime, onTimeUpdate, onPause, onEnded props
   - 16:9 aspect ratio container
   - Glassmorphism border/shadow around player

3. Create app/(dashboard)/watch/[videoId]/page.tsx
   - Server component: fetch video + existing progress from DB
   - Render YouTubePlayer with videoId
   - Video title, playlist name, "Back to playlist" link below player
   - "Next Video" button
```

#### Day 8 — Progress Tracking Engine
```
1. Create lib/schedule.ts with these pure functions:
   - mergeSegments(segments[]) → merged segments (no overlaps)
   - calculateWatchedSeconds(segments[]) → total number
   - calculateProgress(segments[], durationSeconds) → percentage 0–1
   - isVideoComplete(segments[], durationSeconds) → boolean (>= 0.9)
   - splitLongVideo(video, targetSeconds) → parts array

2. Create hooks/useWatchProgress.ts
   - State: segments[] (loaded from DB on mount)
   - activeSegment: { start: number } | null
   - On play: set activeSegment = { start: currentTime }
   - On pause/end: finalize segment, push to segments[], merge, save
   - saveProgress(): POST /api/progress with merged segments
   - Returns: segments, watchedPercent, isComplete

3. Create app/api/progress/route.ts
   - GET ?videoId= : fetch watch_progress row
   - POST: upsert watch_progress (merge incoming + existing segments)
   - Auto-mark video complete if >= 90%

4. Wire useWatchProgress into watch page:
   - Load existing segments on mount
   - Player onPause → finalize + save
   - Player onEnded → finalize + save + show "Next Video" prompt
   - beforeunload event → save (fire and forget)
```

#### Day 9 — Progress Bar UI
```
1. Create components/player/ProgressBar.tsx
   - Accepts: segments[], durationSeconds
   - Renders: horizontal track with colored div slices
   - Green slices = watched segments (use watched segment start/end %)
   - Red fill = everything else (background of track)
   - Hover tooltip: shows timestamp at mouse position
   - Smooth animation when segments update

2. Wire ProgressBar into watch page:
   - Below the YouTube player
   - Updates every time segments state changes
   - Show legend: "Watched X min · Remaining Y min"

3. Create components/player/VideoParts.tsx
   - Only shown for videos that were auto-split
   - List of parts: Part 1 (0:00–1:00:00), Part 2 (1:00:00–2:00:00)
   - Status badge per part: Watched / Partial / Not Started
   - Click part → player seeks to that timestamp
```

#### Day 10 — Resume + Completion
```
1. Resume logic:
   - On player ready: find lastWatchedPosition from segments
   - lastWatchedPosition = end of the last segment
   - seekTo(lastWatchedPosition) on player ready

2. Video completion flow:
   - When isComplete = true:
     → Update video.is_completed in DB
     → Update playlist completion count
     → Show completion toast: "Video complete! 🎉"
     → Show "Watch Next" button prominently

3. Update CourseCard on dashboard:
   - Now wire actual progress from DB
   - Red/green bar reflects real data
   - Completion count shows correctly

4. Update VideoListItem in playlist page:
   - Green check icon for completed videos
   - Partial progress mini-bar for in-progress videos

5. Test the full watch loop:
   - Import playlist → open video → watch 30 seconds → pause
   - Refresh page → resume from where left off
   - Progress bar shows green for watched portion
   - Watch 90%+ → video marked complete → shows in playlist
```

### Phase 3 Done Criteria

- [ ] YouTube player embeds and plays correctly
- [ ] Watching a video records segments in DB (verify in Neon console)
- [ ] Progress bar shows green (watched) and red (unwatched) correctly
- [ ] Refreshing the page → player resumes from last position
- [ ] Completing 90%+ of a video marks it as complete
- [ ] Playlist page shows completion status per video
- [ ] Dashboard CourseCard shows real progress percentage
- [ ] Long video (>2hr) splits into parts correctly
- [ ] beforeunload saves progress (open video, watch, close tab, reopen)

### What NOT to Build in Phase 3

- Schedule/commitment system (data collected in Phase 2 is fine)
- AI Q&A
- Actual schedule calendar view

---

## Phase 4 — Schedule System + Commitment
**Days 11–13 · Goal: Commitment turns into a real day-by-day schedule users can follow**

### What to Build

#### Day 11 — Schedule Generation
```
1. Complete lib/schedule.ts generateSchedule() function:
   Input: { videos[], commitmentDays, startDate }
   
   Algorithm:
   a. For each video: if duration > SPLIT_THRESHOLD → splitLongVideo()
   b. Flatten all units (videos + parts) into ordered list
   c. Fill days greedily: assign units to Day 1 until targetSeconds reached
   d. When day is full → move to Day 2, continue
   e. Output: schedule_days[] with { dayNumber, date, videoIds[], targetMinutes }

2. Create app/api/schedule/generate/route.ts
   - POST: receives playlistId
   - Fetch playlist + videos from DB
   - Run generateSchedule()
   - Save schedule_days rows to DB
   - Return generated schedule

3. Wire schedule generation into import flow:
   - After playlist is saved (Phase 2) → automatically call schedule generate
   - Show schedule preview in CommitmentForm (this was already UI-only, now wire real data)

4. Create app/api/schedule/[dayId]/route.ts
   - PATCH: mark day as complete (is_completed = true, status = 'completed')
```

#### Day 12 — Schedule UI
```
1. Create components/playlist/ScheduleCalendar.tsx
   - Shown on playlist detail page (/playlist/[id])
   - Shows all days in a vertical list
   - Each day is a ScheduleDayCard

2. Create components/playlist/ScheduleDayCard.tsx
   - Day number + calendar date
   - List of videos/parts for that day with durations
   - Target minutes for that day
   - Status badge: Completed ✅ / On Track 🟢 / Behind ⚠️ / Upcoming 🔵
   - "Mark as Complete" button for current day

3. Status calculation logic (in hooks/useSchedule.ts):
   - day.date < today AND is_completed = false → 'behind'
   - day.date = today AND is_completed = false → 'on_track'
   - day.date > today → 'upcoming'
   - is_completed = true → 'completed'

4. Create components/dashboard/TodayTarget.tsx
   - Widget on dashboard
   - "Today's Goal" heading
   - Shows today's schedule day (if exists)
   - "Watch X min today · Video Y + Video Z"
   - Quick link to start watching
   - If behind: "You're behind! Catch up →"
```

#### Day 13 — Dashboard Polish + Stats
```
1. Complete components/dashboard/StatsRow.tsx with real data:
   - Total hours watched (sum all watch_progress.total_watched_seconds)
   - Active courses count
   - Completed courses count

2. Update CourseCard with schedule info:
   - "Day X of Y" label
   - "Xmin/day goal" label
   - On Track / Behind / Upcoming badge
   - Correct red/green progress bar

3. Add deadline display on playlist detail page:
   - "Deadline: Aug 15" shown prominently
   - Days remaining counter
   - Overall on-track vs behind status

4. Test full commitment flow:
   - Import playlist → set 5 days commitment → check schedule generated
   - Schedule_days has correct number of rows in DB
   - Today's target shows on dashboard
   - Watch some videos → completion updates schedule status
   - Force a "behind" state (set day date to yesterday) → badge shows correctly
```

### Phase 4 Done Criteria

- [ ] Importing a playlist + setting commitment days → schedule_days created in DB
- [ ] Playlist detail page shows day-by-day schedule calendar
- [ ] Schedule days show correct status: Completed / On Track / Behind / Upcoming
- [ ] Dashboard shows today's target with correct video list
- [ ] "Mark as Complete" on a schedule day works
- [ ] Stats row shows real numbers from DB
- [ ] CourseCard shows On Track / Behind badge correctly
- [ ] Deadline date displayed on playlist detail page

### What NOT to Build in Phase 4

- AI Q&A
- Streak system
- Social features

---

## Phase 5 — AI Q&A + Polish + Deploy
**Days 14–16 · Goal: AI chat works, app is polished, deployed to production**

### What to Build

#### Day 14 — AI Transcript Q&A
```
1. Create lib/transcript.ts:
   - fetchTranscript(videoId) → raw transcript from youtube-transcript
   - cleanTranscript(raw) → readable string (remove timestamps, clean up)
   - prepareTranscriptForAI(text) → truncated to MAX_TRANSCRIPT_CHARS (80000)

2. Create app/api/transcript/route.ts
   - GET ?videoId= :
     a. Check DB for cached transcript
     b. If not cached: fetch via youtube-transcript
     c. Clean + store in DB (add transcript column to videos table)
     d. Return transcript text
   - Handle: no transcript available → return { available: false }

3. Create lib/claude.ts:
   - streamAnswer(transcript, question) → ReadableStream
   - Uses @anthropic-ai/sdk with streaming
   - System prompt from RULES.md Section 5.2

4. Create app/api/ai/chat/route.ts
   - POST: { videoId, question, transcript }
   - Validate with Zod
   - Rate limit: check question count in session (header or simple DB flag)
   - Stream Claude response back

5. Create components/player/TranscriptChat.tsx
   - Side panel on watch page (slides in from right on desktop)
   - Full panel below player on mobile
   - "Ask about this video" toggle button
   - Chat messages list (user + AI alternating)
   - Text input + send button
   - Streaming: append text chunks as they arrive
   - "No transcript available" graceful fallback
   - Question counter: "3/10 questions used"
```

#### Day 15 — UI Polish
```
1. Framer Motion animations:
   - Page transitions: fade + slide up on all page changes
   - CourseCard: fade in with staggered delay (each card 0.1s later)
   - PlaylistPreview: slide down when it appears
   - TranscriptChat panel: slide in from right
   - ScheduleDayCard: fade in staggered
   - Badge updates: scale animation when status changes

2. Loading skeletons (create for each):
   - CourseCard skeleton (dashboard)
   - VideoListItem skeleton (playlist page)
   - ScheduleDayCard skeleton
   - TranscriptChat skeleton

3. Empty states (create/polish for each):
   - Dashboard: no courses imported yet
   - Playlist: no videos found
   - TranscriptChat: no transcript available
   - Custom playlist: no videos added yet

4. Mobile responsiveness pass:
   - Test every page at 375px
   - Sidebar → hidden, bottom nav visible
   - Player → full width, chat panel → below player
   - Cards → full width, single column
   - Fix any overflow or truncation issues

5. Final UI consistency pass:
   - All glass cards use same classes (from DESIGN.md)
   - All buttons use GlassButton or shadcn Button
   - All colors use CSS variables
   - No hardcoded hex values in JSX
   - Dark background consistent on all pages
```

#### Day 16 — Deploy + Final Testing
```
1. Production environment setup:
   - Neon: create production project, get new connection strings
   - Run drizzle-kit migrate on production DB
   - Google Cloud Console: add production domain to OAuth redirect URIs

2. Vercel deploy:
   - Push final code to GitHub
   - Connect repo to Vercel
   - Add all environment variables in Vercel dashboard
   - Deploy + check build logs

3. Full end-to-end test on production URL:
   - Google login works
   - Import a YouTube playlist
   - Set commitment + schedule generated
   - Watch a video → progress saves
   - Refresh → resume works
   - AI Q&A works
   - Mobile browser test (real phone)

4. README.md:
   - What the app does (2 sentences)
   - Tech stack list
   - Local setup instructions (clone, .env.local, npm install, npm run dev)
   - Environment variables table
   - Screenshots or demo GIF (optional but recommended)

5. Update MEMORY.md:
   - Mark all phases complete
   - Add production URL
   - Note any decisions made during development
```

### Phase 5 Done Criteria

- [ ] Transcript Q&A works for a video that has subtitles enabled
- [ ] "No transcript" graceful fallback shown for videos without subtitles
- [ ] Streaming response works (text appears word by word)
- [ ] Question counter shows and stops at 10
- [ ] All pages have loading skeletons
- [ ] All Framer Motion animations are smooth (no janky transitions)
- [ ] App works on real mobile phone (not just DevTools)
- [ ] Deployed to Vercel with production URL working
- [ ] Google login works on production domain
- [ ] README.md complete with setup instructions

---

## Phase 6 — Streak System + Activity Heatmap
**Days 17–20 · Goal: User can see their daily consistency streak and activity heatmap on dashboard**

### What to Build

#### Day 17 — Streak Engine
```
1. Add new columns to users table (migration required):
   - streak_count        integer DEFAULT 0
   - longest_streak      integer DEFAULT 0
   - last_active_date    date
   Note: Add this migration in MEMORY.md before running

2. Create lib/streak.ts with these functions:
   - calculateStreak(lastActiveDate, currentStreak) → newStreak
   - isStreakAlive(lastActiveDate) → boolean
     Logic: lastActiveDate = yesterday OR today → alive, else broken
   - updateStreak(userId) → { currentStreak, longestStreak, isNewRecord }

3. Create app/api/streak/route.ts
   - POST: called automatically after any watch_progress save
     → fetch user's last_active_date
     → if last_active_date < today → update streak
     → if streak broken (gap > 1 day) → reset to 1
     → save updated streak + last_active_date to DB
   - GET: return current streak + longest streak for user

4. Wire streak update into progress save flow:
   - In /api/progress POST handler → after saving segments
   - Call streak update automatically (fire and forget is ok)
```

#### Day 18 — Activity Heatmap Data
```
1. Add new table to schema: activity_log
   - id              uuid PRIMARY KEY
   - user_id         uuid REFERENCES users(id)
   - date            date NOT NULL
   - minutes_watched integer DEFAULT 0
   - videos_watched  integer DEFAULT 0
   UNIQUE(user_id, date)   ← one row per user per day

2. Run drizzle-kit generate + migrate
   Note this schema change in MEMORY.md

3. Update /api/progress POST handler:
   - After saving watch segments → upsert activity_log for today
   - minutes_watched = total minutes across all videos today
   - videos_watched = count of videos with new progress today

4. Create app/api/activity/route.ts
   - GET ?days=365 : fetch last N days of activity_log for current user
   - Return: array of { date, minutesWatched, videosWatched }
   - Fill missing dates with 0 (so heatmap renders correctly)
```

#### Day 19 — Heatmap UI Component
```
1. Create components/dashboard/ActivityHeatmap.tsx
   - GitHub contribution graph style
   - 52 columns (weeks) × 7 rows (days) = 364 day grid
   - Each cell is a small square (10×10px desktop, 8×8px mobile)
   - Color scale based on minutesWatched:
     → 0 min    : bg-white/[0.04]  (empty — very dark)
     → 1–20 min : bg-purple-900/60 (light purple)
     → 21–45 min: bg-purple-600/70 (medium purple)
     → 46–60 min: bg-purple-500    (strong purple)
     → 60+ min  : bg-purple-400    (brightest — goal met)
   - Tooltip on hover: "Jul 17 — 42 min watched"
   - Month labels above columns (Jan, Feb, Mar...)
   - Day labels on left (Mon, Wed, Fri)
   - Horizontal scroll on mobile

2. Create components/dashboard/StreakCard.tsx
   - Current streak: big number with 🔥 emoji
   - "X day streak" label
   - Longest streak: "Personal best: Y days"
   - If streak = 0: "Start your streak today!"
   - If streak broken: "Streak reset — start fresh 💪"
   - Framer Motion: number animates up when streak increases

3. Add both components to dashboard page:
   - StreakCard → top right of dashboard (or next to StatsRow)
   - ActivityHeatmap → below My Courses section
   - Fetch data: GET /api/streak + GET /api/activity?days=365
```

#### Day 20 — Streak Recovery + Testing
```
1. Streak recovery modal:
   - If user opens app and streak was broken yesterday
   - Show modal: "You missed a day! Your streak of X days has reset."
   - Dismiss button: "Start fresh — Day 1"
   - Store "shown" flag in localStorage so modal doesn't repeat

2. Streak milestone toasts:
   - 3 days  → "3 day streak! 🔥 Keep going!"
   - 7 days  → "One week streak! 🎉"
   - 30 days → "30 days! You're unstoppable! 🏆"
   - Show via react-hot-toast with custom styling

3. Test streak logic thoroughly:
   - Watch video → streak becomes 1
   - Simulate next day (manually change last_active_date in DB) → streak becomes 2
   - Skip a day → streak resets to 0 on next watch
   - Verify heatmap renders correct colors for different watch amounts
   - Verify longest_streak updates correctly when current > longest
```

### Phase 6 Done Criteria

- [ ] Watching a video updates streak_count in users table (verify in Neon)
- [ ] Streak resets to 1 if more than 1 day was skipped
- [ ] longest_streak updates when current streak exceeds it
- [ ] StreakCard shows correct current streak + longest streak
- [ ] ActivityHeatmap renders 365-day grid with correct colors
- [ ] Heatmap tooltip shows date + minutes on hover
- [ ] Streak milestone toasts fire at 3, 7, 30 days
- [ ] Activity log upserts correctly on each watch session

### What NOT to Build in Phase 6

- Certificate generation
- Public profile
- PWA features
- Notes or quiz features

---

## Phase 7 — Completion Certificate + Public Profile
**Days 21–24 · Goal: Users get a certificate when they finish a course and can share their progress publicly**

### What to Build

#### Day 21 — Completion Detection + Certificate Data
```
1. Add new table: certificates
   - id              uuid PRIMARY KEY
   - user_id         uuid REFERENCES users(id)
   - playlist_id     uuid REFERENCES playlists(id)
   - issued_at       timestamp DEFAULT now()
   - total_hours     decimal   ← actual hours watched
   - share_token     text UNIQUE ← random token for public URL
   UNIQUE(user_id, playlist_id)  ← one cert per course per user

2. Run drizzle-kit generate + migrate
   Note schema change in MEMORY.md

3. Create lib/certificate.ts:
   - generateShareToken() → random 12-char alphanumeric string
   - calculateCompletionStats(playlistId, userId) → { totalHours, videosCount, daysToComplete }

4. Create app/api/certificates/route.ts
   - POST: called when playlist completion hits 100%
     → check if certificate already exists (avoid duplicates)
     → calculate completion stats
     → generate share token
     → save to certificates table
     → return certificate data
   - GET ?playlistId= : check if certificate exists for this playlist

5. Wire completion check into progress save:
   - In /api/progress POST → after updating video completion
   - Check if all videos in playlist are complete
   - If yes → POST /api/certificates automatically
```

#### Day 22 — Certificate UI (Canvas Generation)
```
1. Create app/(dashboard)/certificate/[id]/page.tsx
   - Shows certificate for a completed course
   - Two sections: Preview + Download/Share actions

2. Create components/certificate/CertificateCanvas.tsx
   - Uses HTML Canvas API (no external library needed)
   - Canvas size: 900×636px (landscape, like a real certificate)
   - Design:
     → Dark background: #0A0812
     → Purple gradient border (4px, rounded corners)
     → Glowing purple orb at top center
     → "LearnLoop" logo text top center (Syne font via canvas)
     → "Certificate of Completion" — large heading
     → "This certifies that" — small text
     → User's name — large bold text (from Google account)
     → "has successfully completed" — small text
     → Course title — medium bold text
     → Stats row: total hours | videos completed | days taken
     → Issue date bottom left
     → Share URL bottom right (small)
     → Decorative purple divider lines
   - Ref the canvas element for download

3. Download function:
   - canvas.toBlob() → create download link → click()
   - File name: "LearnLoop-Certificate-[CourseTitle].png"
   - Button: "Download Certificate" with download icon

4. Share button:
   - Copy link: navigator.clipboard.writeText(shareUrl)
   - Share URL format: learnloop.app/cert/[shareToken]
   - Toast: "Link copied to clipboard!"
```

#### Day 23 — Public Certificate Page + Public Profile
```
1. Create app/cert/[token]/page.tsx (PUBLIC — no auth required)
   - Fetch certificate by share_token
   - If not found → 404 page
   - Shows read-only certificate preview
   - "Verified by LearnLoop" badge
   - No download button (view only for public)
   - Meta tags for link preview (og:image, og:title)

2. Add users table columns (migration):
   - username       text UNIQUE  ← user sets this
   - bio            text
   - is_public      boolean DEFAULT false
   Note in MEMORY.md before migrating

3. Create app/(dashboard)/profile/page.tsx (PRIVATE settings)
   - Edit username (check uniqueness via API)
   - Toggle: "Make my profile public"
   - Bio text input (max 160 chars)
   - List of earned certificates
   - Account info (name, email, Google avatar)
   - "View public profile →" link

4. Create app/u/[username]/page.tsx (PUBLIC — no auth required)
   - Only visible if user.is_public = true
   - If private → show "This profile is private"
   - Shows:
     → Avatar + name + bio
     → Stats: total hours learned, courses completed, current streak
     → Earned certificates grid (each links to /cert/[token])
     → Activity heatmap (read-only, last 90 days)
   - "Learning with LearnLoop" footer badge
   - og:image meta tag for link preview

5. Create app/api/profile/route.ts
   - GET ?username= : fetch public profile data
   - PATCH: update username, bio, is_public (auth required)
```

#### Day 24 — Polish + Share Flow
```
1. Playlist completion celebration:
   - When all videos complete → confetti animation (use canvas-confetti npm)
   - Modal: "Course Complete! 🎉"
     → Course title
     → Stats: X hours in Y days
     → "View Certificate" button
     → "Share Achievement" button (copies public profile link)
   - install: npm install canvas-confetti @types/canvas-confetti

2. Add "Certificates" link to sidebar navigation:
   - Icon: Award (lucide-react)
   - Shows count badge if new certificate earned

3. Add "Profile" link to sidebar:
   - Shows user avatar as icon

4. Update Sidebar.tsx to include new nav links:
   - Dashboard
   - Import Course
   - Custom Playlist
   - Certificates  ← NEW
   - Profile       ← NEW

5. Test full certificate flow:
   - Complete all videos in a playlist
   - Completion modal fires with confetti
   - Certificate generated in DB
   - Download works → PNG looks correct
   - Share link works → public page shows certificate
   - Public profile visible at /u/username
```

### Phase 7 Done Criteria

- [ ] Completing all videos in a playlist → certificate created in DB automatically
- [ ] Certificate page renders correct design with user name + course title
- [ ] Download button downloads PNG file correctly
- [ ] Share link (/cert/[token]) works without login
- [ ] Public profile page at /u/[username] shows stats + certificates
- [ ] Private profiles show "This profile is private" message
- [ ] Confetti fires on course completion
- [ ] Sidebar has Certificates + Profile links
- [ ] Username uniqueness enforced (error shown if taken)

### What NOT to Build in Phase 7

- PWA / offline features
- Timestamp notes
- AI quiz
- Study groups

---

## Phase 8 — Sidebar Expansion + Notes + Final Polish + PWA
**Days 25–28 · Goal: All remaining features added, app is PWA-ready, fully polished**

### What to Build

#### Day 25 — Timestamp Notes
```
1. Add new table: notes (migration required)
   - id                uuid PRIMARY KEY
   - video_id          uuid REFERENCES videos(id) ON DELETE CASCADE
   - user_id           uuid REFERENCES users(id) ON DELETE CASCADE
   - content           text NOT NULL
   - timestamp_seconds integer NOT NULL  ← video time when note was taken
   - created_at        timestamp DEFAULT now()
   Note schema change in MEMORY.md

2. Run drizzle-kit generate + migrate

3. Create app/api/notes/route.ts
   - GET ?videoId= : fetch all notes for a video (ordered by timestamp_seconds)
   - POST: create note { videoId, content, timestampSeconds }
   - DELETE ?noteId= : delete a note

4. Create components/player/TimestampNotes.tsx
   - Second tab on video player page (alongside TranscriptChat)
   - Tab switcher: "AI Q&A" | "Notes"
   - Notes list:
     → Each note: "[2:34]  This concept is important"
     → Timestamp is clickable → player seeks to that time
     → Delete button on each note (×)
   - Add note button:
     → Click "Add Note" → captures player.getCurrentTime()
     → Text input appears
     → Save → POST /api/notes
   - Empty state: "No notes yet. Click 'Add Note' while watching."

5. Export notes as text:
   - "Export Notes" button at top of notes panel
   - Generates a .txt file:
     "[Course Title] — Notes
     
     [2:34] This concept is important
     [15:20] Remember this formula
     ..."
   - Uses Blob + URL.createObjectURL() for download
   - No external library needed
```

#### Day 26 — Sidebar Expansion + Navigation Polish
```
1. Update Sidebar.tsx with ALL navigation links:

   MAIN
   - Dashboard          (LayoutDashboard icon)
   
   LEARNING  
   - Import Course      (Plus icon)
   - Custom Playlist    (ListVideo icon)
   
   PROGRESS
   - My Certificates    (Award icon) + count badge
   - Activity           (BarChart2 icon) → links to /activity (heatmap full page)
   
   ACCOUNT
   - Profile            (User icon)
   - Settings           (Settings icon) → /settings page

2. Create app/(dashboard)/activity/page.tsx
   - Full-page activity view
   - Large heatmap (full year)
   - Stats: total hours this year, best streak, average per day
   - Monthly breakdown bar chart (use recharts)
   - install: npm install recharts

3. Create app/(dashboard)/settings/page.tsx
   - Notification preferences (browser notifications on/off)
   - Daily reminder time picker
   - Theme: Dark only (note: only dark mode supported)
   - Danger zone: Delete account button (with confirmation)

4. Create app/api/settings/route.ts
   - GET: user settings
   - PATCH: update settings
   Add settings column to users table (jsonb):
   { reminderEnabled: boolean, reminderTime: string }

5. Mobile bottom nav — update with new links:
   - Dashboard | Courses | Activity | Profile
   (Keep to 4 items max for mobile)
```

#### Day 27 — PWA Setup + Push Notifications
```
1. Create public/manifest.json:
   {
     "name": "LearnLoop",
     "short_name": "LearnLoop",
     "description": "YouTube Learning Consistency Tracker",
     "start_url": "/dashboard",
     "display": "standalone",
     "background_color": "#0A0812",
     "theme_color": "#7C5CFC",
     "icons": [
       { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
       { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
     ]
   }

2. Create app icons:
   - public/icons/icon-192.png  (192×192 — "LL" on purple bg)
   - public/icons/icon-512.png  (512×512)
   - public/favicon.ico
   Use canvas in a one-off script to generate these

3. Add manifest link to app/layout.tsx:
   <link rel="manifest" href="/manifest.json" />
   <meta name="theme-color" content="#7C5CFC" />

4. Create public/sw.js (service worker):
   - Cache strategy: cache-first for static assets
   - Network-first for API routes
   - Offline fallback page: /offline

5. Create app/offline/page.tsx:
   - Simple page: "You're offline. Your progress will sync when reconnected."
   - Show cached data if available

6. Register service worker in app/layout.tsx:
   useEffect(() => {
     if ('serviceWorker' in navigator) {
       navigator.serviceWorker.register('/sw.js')
     }
   }, [])

7. Daily reminder notifications:
   - On settings save with reminder enabled:
     → Request Notification permission
     → Schedule notification via service worker
   - Notification: "📚 Time to learn! Your daily goal: Watch X min today."
   - Fire at user's selected reminder time

8. Install prompt:
   - Listen for 'beforeinstallprompt' event
   - Show "Install LearnLoop" banner after user's 3rd visit
   - Dismiss button stores flag in localStorage
```

#### Day 28 — Final Polish + Production Launch
```
1. Lighthouse audit and fixes:
   - Run Lighthouse on all main pages
   - Target: Performance 85+, Accessibility 90+, PWA 100
   - Fix any issues found

2. Final animation pass:
   - Every list that loads → stagger animation
   - Every number that updates → count-up animation
   - Page transitions consistent across all pages
   - No layout shift on load (check CLS score)

3. SEO meta tags on all public pages:
   - /u/[username] → og:title, og:description, og:image
   - /cert/[token] → certificate preview image in meta
   - Root layout → default meta tags

4. Error pages:
   - app/not-found.tsx → custom 404 page (dark theme, back to dashboard link)
   - app/error.tsx → custom error boundary page

5. Rate limiting on expensive API routes:
   - /api/youtube/playlist → max 20 requests per user per hour
   - /api/ai/chat → max 50 requests per user per day
   - Use simple DB-based counter (no external rate limit library)

6. Final production deploy:
   - Update all environment variables in Vercel
   - Run final drizzle-kit migrate on production
   - Full end-to-end test on production URL
   - Test on real iOS + Android devices
   - Test PWA install on mobile Chrome

7. Update all documentation:
   - MEMORY.md → mark all phases complete, add production URL
   - README.md → add screenshots, demo GIF, full feature list
   - .env.example → verify all keys documented
```

### Phase 8 Done Criteria

- [ ] Timestamp notes can be added while watching a video
- [ ] Clicking a note timestamp → player seeks to that position
- [ ] Notes export as .txt file correctly
- [ ] Sidebar shows all nav links with correct icons
- [ ] Activity full page shows heatmap + monthly bar chart
- [ ] Settings page saves notification preferences
- [ ] PWA installable on mobile Chrome (manifest + service worker)
- [ ] Offline page shows when network is unavailable
- [ ] Daily reminder notification fires at set time
- [ ] Lighthouse Performance score 85+ on dashboard
- [ ] Custom 404 page working
- [ ] Rate limiting on YouTube + AI routes working
- [ ] Final production deploy complete and tested on real devices

---

## Phase Transition Checklist

Before moving from one phase to the next:

```
□ All "Done Criteria" for current phase are checked
□ npm run build passes with zero errors
□ Zero TypeScript errors (npm run tsc --noEmit)
□ Tested on mobile (375px)
□ Progress saved in DB confirmed (check Neon console)
□ MEMORY.md updated with current phase status
```

---

## Notes for AI Assistants

1. **Read all docs first.** Before writing any code in a session, read PRD.md, ARCHITECTURE.md, RULES.md, PHASES.md, and MEMORY.md.

2. **One phase at a time.** Do not build Phase 3 features while working on Phase 2, even if it seems easy.

3. **Check MEMORY.md.** It tells you what has already been built and what decisions were made. Do not rebuild things that already exist.

4. **Ask before adding libraries.** If you think a new library is needed, ask the developer first. Do not install anything not in RULES.md Section 1.

5. **Do not change the DB schema** after Phase 1 without explicitly noting it in MEMORY.md and running a new migration.

6. **Test before declaring done.** Do not say a feature is complete without actually running the app and verifying the Done Criteria.