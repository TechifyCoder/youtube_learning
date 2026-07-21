# RULES.md
# LearnLoop — Development Rules, Constraints & Guidelines

**Version:** 1.0  
**Read this before writing any code.**  
**These rules exist to prevent the most common mistakes in this stack.**

---

## 1. Libraries — What to USE

### Allowed Libraries Only

Only install what is listed below. Do not add new libraries without a strong reason.

```
# Framework
next@14                       ← App Router only, never Pages Router
react@18
typescript@5

# Styling
tailwindcss@3
framer-motion@11
clsx
tailwind-merge
lucide-react

# UI Components
@radix-ui/react-*             ← via shadcn/ui only
shadcn/ui                     ← run: npx shadcn@latest add [component]

# Database
@neondatabase/serverless
drizzle-orm
drizzle-kit

# Auth
next-auth@5

# YouTube
youtube-transcript             ← transcript fetching only

# AI
@anthropic-ai/sdk

# Forms & Validation
react-hook-form
zod

# Utilities
date-fns
react-hot-toast
```

### Do NOT Install These

```
❌ axios              → use native fetch() instead
❌ moment.js          → use date-fns (lighter)
❌ lodash             → use native JS methods
❌ redux / zustand    → use React state + context for now
❌ react-query        → use Next.js fetch + server components
❌ prisma             → we are using Drizzle ORM
❌ supabase-js        → we are using Neon, not Supabase
❌ express / fastify  → we are using Next.js API routes
❌ mongoose           → we are using PostgreSQL, not MongoDB
❌ styled-components  → we are using Tailwind only
❌ emotion            → we are using Tailwind only
❌ @mui/*             → we are using shadcn/ui only
❌ antd               → we are using shadcn/ui only
```

---

## 2. Code Rules

### 2.1 TypeScript — Always Strict

```typescript
// ✅ CORRECT — always type everything
interface Video {
  id: string
  title: string
  durationSeconds: number
  isCompleted: boolean
}

async function fetchVideo(videoId: string): Promise<Video> { ... }

// ❌ WRONG — never use `any`
async function fetchVideo(videoId: any): Promise<any> { ... }
```

- Never use `any` type — use `unknown` if type is truly unknown, then narrow it
- Never use `// @ts-ignore` — fix the actual type error
- All function parameters and return types must be explicitly typed
- All interfaces go in `/types/index.ts`

### 2.2 API Routes — Always Validate Input

Every API route must validate its input with Zod before doing anything.

```typescript
// ✅ CORRECT
import { z } from 'zod'

const schema = z.object({
  videoId: z.string().uuid(),
  segments: z.array(z.object({
    start: z.number().min(0),
    end: z.number().min(0),
  }))
})

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return Response.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  }

  // now use parsed.data safely
}

// ❌ WRONG — never trust raw input
export async function POST(req: Request) {
  const { videoId, segments } = await req.json()
  // using unvalidated data directly — dangerous
}
```

### 2.3 Auth — Always Check Session

Every API route that touches user data must verify the session first.

```typescript
// ✅ CORRECT
import { auth } from '@/lib/auth'

export async function GET(req: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // safe to query DB now, use session.user.id
}

// ❌ WRONG — never query user data without auth check
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId') // never trust client-sent userId
  const playlists = await db.query.playlists.findMany({ where: eq(playlists.userId, userId!) })
}
```

**Rule:** Never use a `userId` sent from the client. Always get it from `session.user.id`.

### 2.4 Database — Always Use Drizzle, Never Raw SQL Strings

```typescript
// ✅ CORRECT
import { db } from '@/lib/db'
import { playlists } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

const result = await db
  .select()
  .from(playlists)
  .where(and(eq(playlists.userId, session.user.id), eq(playlists.id, playlistId)))

// ❌ WRONG — never raw SQL strings
const result = await db.execute(`SELECT * FROM playlists WHERE user_id = '${userId}'`)
// SQL injection risk + no type safety
```

### 2.5 Fetch — Always Handle Errors

```typescript
// ✅ CORRECT
const res = await fetch('/api/youtube/playlist?url=' + encodeURIComponent(url))

if (!res.ok) {
  const error = await res.json()
  throw new Error(error.message ?? 'Failed to fetch playlist')
}

const data = await res.json()

// ❌ WRONG — never assume fetch succeeded
const data = await fetch('/api/youtube/playlist').then(r => r.json())
// silently fails, data might be an error object
```

### 2.6 Environment Variables — Access Pattern

```typescript
// ✅ CORRECT — server-side only (API routes, server components)
const apiKey = process.env.YOUTUBE_API_KEY!

// ✅ CORRECT — client-side accessible (must have NEXT_PUBLIC_ prefix)
const appUrl = process.env.NEXT_PUBLIC_APP_URL!

// ❌ WRONG — never access secret keys in client components
// process.env.YOUTUBE_API_KEY in a 'use client' component
// This would expose the key in the browser bundle
```

**Rule:** `YOUTUBE_API_KEY`, `ANTHROPIC_API_KEY`, `DATABASE_URL` are server-only. Never reference them in any `'use client'` component.

---

## 3. Next.js App Router Rules

### 3.1 Server vs Client Components

```typescript
// ✅ Server Component (default — no directive needed)
// Can: fetch from DB, access env vars, async/await at top level
// Cannot: useState, useEffect, browser APIs, event handlers

export default async function DashboardPage() {
  const session = await auth()
  const playlists = await getPlaylists(session.user.id)  // DB call is fine
  return <CourseCard playlists={playlists} />
}

// ✅ Client Component (add 'use client' at top)
// Can: useState, useEffect, event handlers, browser APIs
// Cannot: async at top level, direct DB access

'use client'
export function CourseCard({ playlists }: { playlists: Playlist[] }) {
  const [selected, setSelected] = useState<string | null>(null)
  return <div onClick={() => setSelected(playlists[0].id)}>...</div>
}
```

**Rule:** Default to Server Components. Only add `'use client'` when you need interactivity.

### 3.2 Data Fetching Pattern

```typescript
// ✅ CORRECT — fetch in Server Component, pass to Client Component
// app/(dashboard)/dashboard/page.tsx (Server Component)
export default async function DashboardPage() {
  const playlists = await db.select().from(playlists).where(...)
  return <DashboardClient playlists={playlists} />
}

// components/dashboard/DashboardClient.tsx (Client Component)
'use client'
export function DashboardClient({ playlists }: Props) {
  // interactive UI here
}

// ❌ WRONG — fetching in useEffect on client
'use client'
export function DashboardPage() {
  const [playlists, setPlaylists] = useState([])
  useEffect(() => {
    fetch('/api/playlists').then(r => r.json()).then(setPlaylists)
  }, [])
  // This adds unnecessary loading state + network roundtrip
}
```

Exception: `useEffect` fetching is acceptable for user-triggered actions (like importing a URL on button click), not for initial page data.

### 3.3 Route Handlers — Always Return `Response.json()`

```typescript
// ✅ CORRECT
return Response.json({ data: result }, { status: 200 })
return Response.json({ error: 'Not found' }, { status: 404 })

// ❌ WRONG — old Pages Router pattern, does not work in App Router
res.status(200).json({ data: result })
```

---

## 4. YouTube API Rules

### 4.1 Quota Management

The free YouTube Data API v3 quota is **10,000 units per day**. Exceeding it breaks the app until midnight Pacific time.

**Cost per operation:**
```
videos.list        → 1 unit per request (up to 50 videos)
playlistItems.list → 1 unit per request (up to 50 items)
search.list        → 100 units per request  ← EXPENSIVE, AVOID
```

**Rules:**
- Never use `search.list` in application code — it costs 100 units
- Always fetch playlist items in batches of 50 (API max per request)
- Cache fetched playlist data in DB — never re-fetch what you already have
- If a playlist has 100 videos, that is 2 API calls (50 + 50) — acceptable

### 4.2 Error Handling for YouTube API

Always handle these specific cases:

```typescript
// In lib/youtube.ts
export async function fetchPlaylist(url: string) {
  const playlistId = parsePlaylistId(url)

  if (!playlistId) {
    throw new YouTubeError('Invalid YouTube URL', 'INVALID_URL')
  }

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${process.env.YOUTUBE_API_KEY}`
  )

  if (res.status === 403) {
    const body = await res.json()
    if (body.error?.errors?.[0]?.reason === 'quotaExceeded') {
      throw new YouTubeError('YouTube API quota exceeded. Try again tomorrow.', 'QUOTA_EXCEEDED')
    }
    throw new YouTubeError('This playlist is private or unavailable.', 'PRIVATE')
  }

  if (res.status === 404) {
    throw new YouTubeError('Playlist not found.', 'NOT_FOUND')
  }

  if (!res.ok) {
    throw new YouTubeError('Failed to fetch playlist.', 'UNKNOWN')
  }

  return res.json()
}
```

### 4.3 YouTube IFrame Player

- Always load YouTube IFrame API via script tag, not npm package
- Check `window.YT` exists before initializing player
- Always destroy player instance on component unmount to avoid memory leaks

```typescript
// In useYouTubePlayer.ts
useEffect(() => {
  return () => {
    if (playerRef.current) {
      playerRef.current.destroy()
    }
  }
}, [])
```

---

## 5. AI / Claude API Rules

### 5.1 Never Expose API Key to Client

```typescript
// ✅ CORRECT — Claude API called only in API route (server-side)
// app/api/ai/chat/route.ts
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ❌ WRONG — never call Claude from a 'use client' component
// The API key would be visible in the browser network tab
```

### 5.2 Always Include a System Prompt

```typescript
// ✅ CORRECT
const stream = await client.messages.stream({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  system: `You are a helpful learning assistant. 
Answer questions based ONLY on the provided video transcript. 
If the answer is not in the transcript, say so clearly.
Keep answers concise and focused.`,
  messages: [
    {
      role: 'user',
      content: `Transcript:\n${transcript}\n\nQuestion: ${question}`
    }
  ]
})

// ❌ WRONG — no system prompt, no context boundaries
const stream = await client.messages.stream({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  messages: [{ role: 'user', content: question }]
})
```

### 5.3 Always Truncate Long Transcripts

YouTube transcripts can be 50,000–200,000 characters for long videos. Sending the full transcript would be slow and expensive.

```typescript
// In lib/transcript.ts
const MAX_TRANSCRIPT_CHARS = 80000

export function prepareTranscriptForAI(transcript: string): string {
  if (transcript.length <= MAX_TRANSCRIPT_CHARS) return transcript

  // Take first 60k + last 20k chars (beginning + end most relevant)
  const start = transcript.slice(0, 60000)
  const end = transcript.slice(-20000)
  return `${start}\n\n[...transcript truncated...]\n\n${end}`
}
```

### 5.4 Rate Limit AI Questions

```typescript
// In TranscriptChat.tsx
const MAX_QUESTIONS = 10

const [questionCount, setQuestionCount] = useState(0)

const handleSend = () => {
  if (questionCount >= MAX_QUESTIONS) {
    toast.error('Maximum 10 questions per video session reached.')
    return
  }
  setQuestionCount(prev => prev + 1)
  // proceed with API call
}
```

### 5.5 Handle Claude API Errors

```typescript
// In app/api/ai/chat/route.ts
try {
  const stream = await client.messages.stream({ ... })
  // stream to client
} catch (error) {
  if (error instanceof Anthropic.APIError) {
    if (error.status === 429) {
      return Response.json({ error: 'AI rate limit reached. Please wait a moment.' }, { status: 429 })
    }
    if (error.status === 401) {
      return Response.json({ error: 'AI service configuration error.' }, { status: 500 })
    }
  }
  return Response.json({ error: 'AI service unavailable. Try again.' }, { status: 500 })
}
```

---

## 6. Error Handling Rules

### 6.1 Every API Route Must Have Try-Catch

```typescript
// ✅ CORRECT
export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const data = await db.select().from(playlists)
    return Response.json({ data })

  } catch (error) {
    console.error('[GET /api/playlists]', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ❌ WRONG — unhandled errors crash the API route
export async function GET(req: Request) {
  const data = await db.select().from(playlists) // if this throws, no response is sent
  return Response.json({ data })
}
```

### 6.2 Error Response Format — Always Consistent

Every error response must follow this format:

```typescript
// Always return this shape for errors
{ error: string, code?: string, details?: unknown }

// Examples
{ error: 'Unauthorized' }
{ error: 'Invalid input', details: zodError.flatten() }
{ error: 'Playlist not found', code: 'NOT_FOUND' }
{ error: 'YouTube quota exceeded', code: 'QUOTA_EXCEEDED' }
```

### 6.3 Client-Side Error Display

Always show user-facing errors with toast, never with `console.error` only.

```typescript
// ✅ CORRECT
try {
  const res = await fetch('/api/youtube/playlist?url=' + url)
  if (!res.ok) {
    const err = await res.json()
    toast.error(err.error ?? 'Something went wrong')
    return
  }
} catch {
  toast.error('Network error. Check your connection.')
}

// ❌ WRONG
try {
  const res = await fetch('/api/youtube/playlist?url=' + url)
} catch (e) {
  console.error(e)  // user sees nothing
}
```

### 6.4 Loading States — Always Required

Every async action must have a loading state.

```typescript
// ✅ CORRECT
const [loading, setLoading] = useState(false)

const handleImport = async () => {
  setLoading(true)
  try {
    await importPlaylist(url)
  } finally {
    setLoading(false)  // always reset, even on error
  }
}

return <button disabled={loading}>{loading ? 'Importing...' : 'Import'}</button>
```

---

## 7. Progress Tracking Rules

These rules specifically govern the watch progress feature — the most critical part of the app.

### 7.1 Segment Merge — Always Run After Save

```typescript
// In lib/schedule.ts
export function mergeSegments(segments: Segment[]): Segment[] {
  if (segments.length === 0) return []

  const sorted = [...segments].sort((a, b) => a.start - b.start)
  const merged: Segment[] = [sorted[0]]

  for (let i = 1; i < sorted.length; i++) {
    const last = merged[merged.length - 1]
    if (sorted[i].start <= last.end + 2) {
      // merge — also handle 2-second gap tolerance
      last.end = Math.max(last.end, sorted[i].end)
    } else {
      merged.push(sorted[i])
    }
  }

  return merged
}
```

**Rule:** Always merge segments before saving to DB and before rendering the progress bar.

### 7.2 Save on Multiple Triggers

Progress must be saved when:
- Video is paused
- Video ends
- User navigates away from the page (`beforeunload` event)
- User clicks "Next Video"

```typescript
// In YouTubePlayer.tsx
useEffect(() => {
  const handleBeforeUnload = () => {
    saveProgress()  // fire-and-forget on page close
  }
  window.addEventListener('beforeunload', handleBeforeUnload)
  return () => window.removeEventListener('beforeunload', handleBeforeUnload)
}, [saveProgress])
```

### 7.3 Completion Threshold

A video is only marked complete at **90% watched**, not 100%. This prevents penalizing users for skipping intro/outro sections.

```typescript
// In lib/schedule.ts
export const COMPLETION_THRESHOLD = 0.9

export function isVideoComplete(totalWatchedSeconds: number, durationSeconds: number): boolean {
  return totalWatchedSeconds / durationSeconds >= COMPLETION_THRESHOLD
}
```

---

## 8. UI / Styling Rules

### 8.1 Glassmorphism — Consistent Pattern

Always use these exact Tailwind classes for glass cards. Do not invent new variants.

```typescript
// ✅ Standard glass card
<div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5">

// ✅ Stronger glass (for modals, dropdowns)
<div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">

// ✅ Subtle glass (for list items)
<div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.07] rounded-xl p-3">

// ❌ WRONG — random opacity values not from the pattern above
<div className="bg-white/15 backdrop-blur-lg border border-white/30">
```

### 8.2 Colors — Use CSS Variables, Not Arbitrary Values

Define these in `globals.css` and use them everywhere:

```css
/* globals.css */
:root {
  --accent: #7C5CFC;
  --accent-light: #A78BFA;
  --green: #22C55E;
  --red: #EF4444;
  --yellow: #F59E0B;
  --bg-primary: #0A0812;
  --bg-card: #1A1628;
  --text-main: #F1F0FF;
  --text-sub: #A09CB8;
}
```

```typescript
// ✅ CORRECT — use CSS variable via Tailwind arbitrary value
<div className="text-[var(--accent)]">

// Or define in tailwind.config.ts and use as:
<div className="text-accent">

// ❌ WRONG — hardcoding hex values in JSX
<div style={{ color: '#7C5CFC' }}>
```

### 8.3 Animations — Always Use Framer Motion

```typescript
// ✅ CORRECT — use framer-motion for all transitions
import { motion } from 'framer-motion'

<motion.div
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, ease: 'easeOut' }}
>
  <CourseCard />
</motion.div>

// ❌ WRONG — CSS transitions on layout elements
<div className="transition-all duration-300 ease-out">
// Use this only for hover states, not entrance animations
```

### 8.4 No Inline Styles

```typescript
// ✅ CORRECT
<div className="flex items-center gap-3 p-4 rounded-xl bg-white/5">

// ❌ WRONG
<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
```

Exception: The progress bar segments need dynamic widths calculated from percentages — inline style is acceptable there.

```typescript
// ✅ Acceptable exception
<div
  className="h-full bg-green-500 rounded-l-full"
  style={{ width: `${watchedPercent}%` }}  // dynamic value — inline style is fine here
/>
```

### 8.5 Responsive Design — Mobile First

All components must work at 375px (iPhone SE) and above.

```typescript
// ✅ CORRECT — mobile first, then expand
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

// ❌ WRONG — desktop first breaks mobile
<div className="grid grid-cols-3 gap-4">
```

Test at: 375px, 768px, 1280px before marking any page done.

---

## 9. File & Component Rules

### 9.1 File Naming

```
Pages:         lowercase with hyphens    page.tsx, layout.tsx
Components:    PascalCase                CourseCard.tsx, ProgressBar.tsx
Hooks:         camelCase with use        useWatchProgress.ts
Utilities:     camelCase                 schedule.ts, youtube.ts
Types:         index.ts (central file)
```

### 9.2 Component Size

If a component file exceeds 200 lines, split it into smaller sub-components.

### 9.3 No Business Logic in Components

```typescript
// ✅ CORRECT — logic in lib/, component just renders
import { mergeSegments, calculateProgress } from '@/lib/schedule'

export function ProgressBar({ segments, duration }: Props) {
  const merged = mergeSegments(segments)
  const percent = calculateProgress(merged, duration)
  return <div>...</div>
}

// ❌ WRONG — business logic inside component
export function ProgressBar({ segments, duration }: Props) {
  // sorting, merging logic written inline here — hard to test
  const sorted = segments.sort(...)
  const merged = sorted.reduce(...)
}
```

---

## 10. Git Rules

### Commit Message Format

```
feat: add red/green progress bar to video player
fix: merge overlapping watch segments correctly
chore: install framer-motion and configure tailwind
refactor: extract schedule logic to lib/schedule.ts
```

### What to Never Commit

```
.env.local                ← contains secret keys
node_modules/             ← should already be in .gitignore
.next/                    ← build output
*.log                     ← log files
```

### .gitignore Must Include

```
.env.local
.env*.local
node_modules/
.next/
out/
dist/
*.log
.DS_Store
```

---

## Quick Reference Checklist

Before marking any feature as done, verify:

- [ ] Input validated with Zod
- [ ] Session checked before DB query
- [ ] Try-catch on all async operations
- [ ] Loading state shown during async actions
- [ ] Error shown to user via toast (not just console)
- [ ] TypeScript has no `any` types
- [ ] Component works on mobile (375px)
- [ ] No secret keys accessed in client components
- [ ] Progress segments merged before save and render
- [ ] Framer Motion used for entrance animations
