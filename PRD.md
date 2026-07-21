# PRD — Product Requirements Document
# LearnLoop: YouTube Learning Consistency Tracker

**Version:** 1.0  
**Status:** Ready for Development  
**Last Updated:** July 2026

---

## 1. What Are We Building?

LearnLoop is a **web application** that helps people learn consistently from YouTube content. It solves a very specific problem: people save YouTube playlists to "watch later" and never finish them. LearnLoop turns passive YouTube watching into an active, trackable, commitment-based learning system.

### The Core Loop

```
User imports YouTube playlist / creates custom playlist
        ↓
User sets a commitment: "I will finish this in 10 days"
        ↓
App generates a day-by-day schedule automatically
        ↓
User watches videos inside LearnLoop's player
        ↓
App tracks exactly which seconds were watched (red = unwatched, green = watched)
        ↓
User can ask AI questions about video content using transcripts
        ↓
User stays on schedule or gets notified they are behind
```

### What Makes It Different

| Problem | LearnLoop's Solution |
|---|---|
| No tracking of what you actually watched | Segmented red/green progress bar per video |
| Long videos feel overwhelming | Auto-split into parts based on your schedule |
| No commitment system | Set a deadline, app calculates daily target |
| Can't ask questions about video content | AI Q&A using video transcript |
| Scattered links with no structure | Custom playlists from any YouTube videos |

---

## 2. Target Users

### Primary User

**Self-taught learners** — people who use YouTube as their primary learning platform. They are learning programming, design, finance, language, or any other skill through YouTube courses and tutorials.

**Profile:**
- Age 18–35
- Students or early-career professionals
- Use YouTube to learn skills outside formal education
- Have started many courses but finished very few
- Prefer free resources over paid platforms like Udemy or Coursera
- Already comfortable with web apps

**Their Pain Points:**
- Start a 10-hour Python course, watch 2 hours, never return
- Don't know exactly where they left off
- No sense of daily progress or momentum
- Long videos feel impossible to plan around
- No accountability mechanism

### Secondary User

**Professionals upskilling** — people learning new tools, frameworks, or concepts for their job. They have less time, so structured scheduling matters even more.

**Profile:**
- Working professionals, 25–40
- Learning specific skills like React, AI tools, Excel, marketing
- Need to fit learning into 30–60 minute daily windows
- Value efficiency — want to know exactly what to watch today

### Who This Is NOT For

- People who want to watch YouTube casually or for entertainment
- Users who need team or classroom features (this is individual-focused for now)
- People learning through books, podcasts, or non-YouTube platforms

---

## 3. Features

### 3.1 Authentication

**Google Login**
- Single sign-in with Google OAuth
- No email/password — just one click
- User profile pulled from Google (name, avatar)
- Session persists across browser sessions

---

### 3.2 YouTube Playlist Import

**What it does:** User pastes any YouTube URL and the app fetches all video details automatically.

**Accepted URL types:**
- Full YouTube playlist: `https://youtube.com/playlist?list=PLxxx`
- Single video: `https://youtube.com/watch?v=xxx`
- Short URL: `https://youtu.be/xxx`

**What gets fetched (YouTube Data API v3):**
- Playlist title and thumbnail
- All video IDs, titles, thumbnails
- Duration of each video in seconds
- Total playlist duration

**User flow:**
1. Paste URL → click Import
2. See loading state: "Fetching playlist..."
3. Preview card appears: title, video count, total duration
4. User sets commitment (days to complete)
5. App shows schedule preview
6. Click "Add to My Courses" → saved to database

**Edge cases handled:**
- Private or deleted videos → skip with warning
- Invalid URL → show clear error message
- Single video pasted → treat as 1-video playlist
- YouTube API quota exceeded → show friendly error

---

### 3.3 Custom Playlist Creation

**What it does:** User builds their own playlist from individual YouTube video links, without needing an existing YouTube playlist.

**User flow:**
1. Switch to "Multiple Videos" tab on Import page
2. Paste video URLs one by one → each is fetched and added to list
3. Reorder videos (up/down buttons)
4. Remove any video from list
5. Give playlist a name
6. Set commitment days
7. Save → works identically to an imported playlist

**Use case:** User has 5 different tutorials from 5 different channels they want to learn in sequence.

---

### 3.4 Video Player with Progress Tracking

**This is the most important feature of the app.**

**Player:**
- YouTube IFrame Player embedded inside the app
- Clean UI — no YouTube sidebar, no recommendations shown
- Standard controls: play, pause, seek, fullscreen, volume

**Progress Bar (Red/Green Segmented Bar):**
- Custom-built bar below the video player
- Shows the full video duration as a horizontal track
- **Green segments** = portions the user has actually watched
- **Red segments** = portions not yet watched
- Updates in real time as user watches
- Hover over any point to see the timestamp

**How tracking works technically:**
- YouTube IFrame API fires `onStateChange` events
- When playing: record `{start: currentTime}` every 5 seconds
- When paused/ended: record `{end: currentTime}`, save segment to DB
- Segments are stored as JSON array: `[{start: 60, end: 1200}, {start: 1500, end: 2100}]`
- Overlapping segments are merged automatically
- Progress saved on: pause, video end, tab close, page navigation

**Video completion:**
- A video is marked complete when 90% or more of it has been watched
- Partial completion counts toward schedule progress proportionally

**Resume:**
- When user returns to a video, player seeks to the last watched position automatically

---

### 3.5 Long Video Auto-Split

**What it does:** Breaks videos longer than 2 hours into manageable parts, aligned with the user's daily schedule.

**Rules:**
- Videos under 2 hours (7200 seconds) → not split
- Videos 2+ hours → split into parts
- Part size = commitment's hours-per-day target (e.g. if 1hr/day, split into 1hr chunks)
- Minimum part size: 20 minutes
- Maximum part size: 2 hours

**Example:**
- 10-hour course, 10-day commitment = 1 hour per day
- Video 1 is 3 hours → becomes Part 1 (1hr), Part 2 (1hr), Part 3 (1hr)
- Each part is a separate schedule entry

**UI on player page:**
- "Parts" list shown below the progress bar
- Each part shows: Part number, time range (e.g. "0:00 – 1:00:00"), status (Watched / Partial / Not Started)
- User can click any part to jump directly to that timestamp

---

### 3.6 Commitment & Schedule System

**What it does:** Turns a playlist into a structured day-by-day plan.

**Input from user:**
- How many days to complete the course (e.g. 10 days)
- Start date (defaults to today)

**What the app calculates:**
- `total_duration_seconds / commitment_days` = target seconds per day
- Distributes videos across days, filling each day up to the target
- Long videos get split across days
- If a video is longer than one day's target, it spans multiple days

**Output:**
- Day-by-day schedule saved to database
- Each day shows: which videos/parts to watch, total minutes for that day
- Deadline date calculated and shown

**Schedule status per day:**
- **On Track** (green) — user watched today's content on time
- **Behind** (red/yellow) — missed one or more days
- **Upcoming** (purple) — future day, not yet due
- **Completed** (green check) — done

**Dashboard shows:**
- Today's target: "Watch 58 min today — Video 3 + Video 4 Part 1"
- Overall progress: days completed / total days
- Days remaining until deadline

---

### 3.7 Transcript-Based AI Q&A

**What it does:** Lets users ask questions about a video's content using Claude AI.

**How it works:**
1. When user opens a video, transcript is fetched via `youtube-transcript` npm package
2. Transcript stored in DB for that video (fetched once, cached)
3. Side panel on player page: "Ask about this video"
4. User types a question
5. App sends: transcript + question to Claude API (`claude-sonnet-4-6`)
6. Response streams back word by word
7. Chat history maintained for that video session (in component state)

**Limitations shown to user clearly:**
- If no transcript available: "This video doesn't have a transcript. Q&A is not available."
- If transcript is very long (>100k chars): truncated with notice
- Max 10 questions per video per session (to control API costs)

---

### 3.8 Dashboard

**What it shows:**
- All active courses with thumbnails and progress bars
- Today's schedule: what to watch right now
- Overall stats: total hours watched, courses active, courses completed
- Quick access to continue any course

**Course card shows:**
- Thumbnail + title
- Source badge (YouTube / Custom)
- Red/green segmented progress bar
- Schedule status badge (On Track / Behind / Upcoming)
- "Day X of Y · Zmin/day" label
- Click → goes to playlist detail page

---

### 3.9 Playlist Detail Page

**What it shows:**
- All videos in the playlist in order
- Each video: thumbnail, title, duration, completion status (green check or not)
- Full schedule: day-by-day breakdown
- Overall playlist progress bar
- Deadline date

**Actions:**
- Click any video → go to player page
- See which day each video belongs to
- Mark individual days as complete manually (override)

---

## 4. Out of Scope (Not in This Version)

These are explicitly excluded from the MVP:

- Streak system / gamification
- Social features / study groups / leaderboards
- AI quiz generation
- Timestamp notes
- Spaced repetition reminders
- Mobile app (PWA only, responsive web)
- Non-YouTube content sources
- Offline mode
- Browser extension

---

## 5. Success Criteria

The MVP is complete when:

1. A user can sign in with Google
2. A user can import a YouTube playlist and see all videos fetched correctly
3. A user can create a custom playlist from individual video URLs
4. A user can set a commitment and see a day-by-day schedule generated
5. A user can watch a video inside the app with the red/green progress bar working
6. Progress is saved and restored correctly when the user returns
7. Long videos (2hr+) are split into parts correctly
8. A user can ask a question about a video and get a relevant AI answer
9. The dashboard correctly shows progress and today's schedule
10. The app works on mobile browsers (responsive)
