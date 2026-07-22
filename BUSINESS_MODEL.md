# BUSINESS_MODEL.md
# LearnLoop — BYOK & Subscription Model

**Version:** 1.0  
**Build after:** Phase 8 complete (full app working)  
**This is Phase 9 — the monetization layer**

---

## Two Modes Overview

```
┌─────────────────────────────────────────────────────────┐
│                    LearnLoop                            │
│                                                         │
│   ┌──────────────────┐    ┌──────────────────────┐     │
│   │   BYOK Mode      │    │  Subscription Mode   │     │
│   │  (Free Forever)  │    │   (₹X/month)         │     │
│   │                  │    │                      │     │
│   │ User brings:     │    │ You provide:         │     │
│   │ • Gemini API key │    │ • Gemini API key     │     │
│   │ • YouTube API key│    │ • YouTube API key    │     │
│   │ • Neon DB URL    │    │ • Neon DB (shared)   │     │
│   │                  │    │                      │     │
│   │ User controls:   │    │ User gets:           │     │
│   │ • Their own data │    │ • Zero setup         │     │
│   │ • No limits      │    │ • Just works         │     │
│   │ • Full privacy   │    │ • Support            │     │
│   └──────────────────┘    └──────────────────────┘     │
└─────────────────────────────────────────────────────────┘
```

---

## Mode 1 — BYOK (Bring Your Own Keys)

### What User Provides

```
1. YouTube Data API v3 Key
   → Get from: console.cloud.google.com
   → Free: 10,000 units/day (enough for personal use)

2. Google Gemini API Key  
   → Get from: aistudio.google.com
   → Free: 15 RPM, 1500 requests/day

3. Neon Database URL
   → Get from: neon.tech (free account)
   → Free: 0.5 GB storage
   → User creates their OWN Neon project
   → Their data stays in THEIR database
```

### Why BYOK Makes Sense

- **Privacy** — user's learning data never touches your servers
- **No cost for you** — API calls billed to user's own accounts
- **No limits** — user can use as much as their free tier allows
- **Trust** — developers and privacy-conscious users will prefer this
- **Virality** — developers share it as "free + open" tool

### BYOK Setup Flow (Onboarding)

```
New user signs up → Mode Selection Screen:

┌──────────────────────────────────────────────┐
│  Welcome to LearnLoop!                       │
│  Choose how you want to use the app:         │
│                                              │
│  ┌────────────────────┐                      │
│  │  🔑 BYOK Mode      │  ← Recommended      │
│  │  Free forever      │                      │
│  │  Bring your own    │                      │
│  │  API keys + DB     │                      │
│  │                    │                      │
│  │  [Get Started →]   │                      │
│  └────────────────────┘                      │
│                                              │
│  ┌────────────────────┐                      │
│  │  ⚡ Pro Mode       │                      │
│  │  ₹299/month        │                      │
│  │  Everything        │                      │
│  │  set up for you    │                      │
│  │                    │                      │
│  │  [Start Trial →]   │                      │
│  └────────────────────┘                      │
└──────────────────────────────────────────────┘
```

### BYOK Onboarding — Step by Step

```
Step 1 of 3 — YouTube API Key
┌────────────────────────────────────────────┐
│  🎬 YouTube API Key                        │
│                                            │
│  This lets LearnLoop fetch your playlists  │
│  and video information.                    │
│                                            │
│  [How to get your key →] (opens guide)     │
│                                            │
│  ┌──────────────────────────────────────┐  │
│  │  Paste your YouTube API key...       │  │
│  └──────────────────────────────────────┘  │
│                                            │
│  [Test Key]  [Skip for now]  [Next →]      │
└────────────────────────────────────────────┘

Step 2 of 3 — Gemini API Key
  (Same layout — for AI quiz generation)
  [How to get key from aistudio.google.com →]

Step 3 of 3 — Your Database
┌────────────────────────────────────────────┐
│  🗄️ Your Personal Database                │
│                                            │
│  Your progress is saved in YOUR database.  │
│  We never see your learning data.          │
│                                            │
│  Create a free Neon database:              │
│  1. Go to neon.tech                        │
│  2. Create new project                     │
│  3. Copy the "Pooled connection" URL       │
│                                            │
│  [Open Neon →]  [Watch 2-min guide →]      │
│                                            │
│  ┌──────────────────────────────────────┐  │
│  │  postgresql://user:pass@host/db      │  │
│  └──────────────────────────────────────┘  │
│                                            │
│  [Test Connection]  [Finish Setup →]       │
└────────────────────────────────────────────┘
```

### BYOK — Technical Implementation

```typescript
// lib/userKeys.ts

export interface UserKeys {
  youtubeApiKey: string | null
  geminiApiKey: string | null
  databaseUrl: string | null
}

// Add to users table:
// youtube_api_key    text  (encrypted at rest)
// gemini_api_key     text  (encrypted at rest)
// byok_database_url  text  (encrypted at rest)
// mode               text  'byok' | 'subscription'

export async function getUserKeys(userId: string): Promise<UserKeys> {
  const user = await db.select().from(users).where(eq(users.id, userId))
  return {
    youtubeApiKey: decrypt(user.youtubeApiKey),
    geminiApiKey: decrypt(user.geminiApiKey),
    databaseUrl: decrypt(user.byokDatabaseUrl),
  }
}

// For BYOK database mode — user's own Neon DB
export async function getDbClient(userId: string) {
  const { databaseUrl } = await getUserKeys(userId)

  if (databaseUrl) {
    // User's own database
    const { neon } = await import('@neondatabase/serverless')
    const sql = neon(databaseUrl)
    return drizzle(sql)
  }

  // Subscription mode — your shared database
  return db  // default DB client
}
```

### Encrypting API Keys

```typescript
// lib/encrypt.ts
// Use Node.js built-in crypto — no external library

import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!  // 32-byte hex string
const IV_LENGTH = 16

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv
  )
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()])
  return iv.toString('hex') + ':' + encrypted.toString('hex')
}

export function decrypt(text: string): string {
  const [ivHex, encryptedHex] = text.split(':')
  const iv = Buffer.from(ivHex, 'hex')
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv
  )
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, 'hex')),
    decipher.final()
  ])
  return decrypted.toString()
}

// Generate ENCRYPTION_KEY:
// node -e "console.log(crypto.randomBytes(32).toString('hex'))"
// Add to .env.local as ENCRYPTION_KEY
```

---

## Mode 2 — Subscription

### Pricing (Suggested)

```
Free Trial:    7 days full access, no credit card
Basic:         ₹199/month  →  5 active courses, no AI quiz
Pro:           ₹399/month  →  Unlimited courses + AI quiz + certificates
Annual Pro:    ₹2999/year  →  Same as Pro, 37% savings
```

### What Subscription Includes

```
Basic (₹199/month):
  ✓ YouTube playlist import (unlimited)
  ✓ Custom playlists (unlimited)
  ✓ Red/green progress tracking
  ✓ Schedule + commitment system
  ✓ Streak + heatmap
  ✗ AI quiz (BYOK key needed or Pro)
  ✗ Transcript Q&A (BYOK key needed or Pro)
  ✗ Certificate generation
  ✗ Public profile

Pro (₹399/month):
  ✓ Everything in Basic
  ✓ AI quiz after every video (Gemini included)
  ✓ Transcript Q&A (Claude included)
  ✓ Certificate generation
  ✓ Public profile + shareable links
  ✓ Timestamp notes
  ✓ PWA + notifications
  ✓ Priority support
```

### Payment Integration — Razorpay (India-first)

```
Why Razorpay:
- Best for Indian market (UPI, cards, netbanking)
- Simple API
- Low fees: 2% per transaction
- No monthly fee
- INR currency support

Install:
npm install razorpay

Flow:
1. User clicks "Upgrade to Pro"
2. Frontend calls POST /api/payments/create-order
3. Backend creates Razorpay order
4. Frontend opens Razorpay checkout modal
5. User pays → Razorpay sends webhook
6. Backend verifies webhook signature
7. Update user.mode = 'subscription', user.plan = 'pro'
8. Redirect to dashboard with success toast
```

```typescript
// app/api/payments/create-order/route.ts
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan } = await req.json()

  const amount = plan === 'pro_monthly' ? 39900 : 299900  // in paise

  const order = await razorpay.orders.create({
    amount,
    currency: 'INR',
    receipt: `order_${session.user.id}_${Date.now()}`,
    notes: { userId: session.user.id, plan }
  })

  return Response.json({ orderId: order.id, amount, currency: 'INR' })
}

// app/api/payments/webhook/route.ts
// Verify Razorpay webhook signature
// Update user subscription status in DB
```

### Subscription DB Schema

```sql
-- Add to users table:
mode              text    DEFAULT 'byok'        -- 'byok' | 'subscription'
plan              text    DEFAULT 'free'         -- 'free' | 'basic' | 'pro'
plan_expires_at   timestamp                      -- null = never (annual)
razorpay_customer_id  text                       -- for recurring payments

-- New table: payments
payments
  id                uuid        PRIMARY KEY
  user_id           uuid        REFERENCES users(id)
  razorpay_order_id text        NOT NULL
  razorpay_payment_id text
  amount_paise      integer
  plan              text
  status            text        -- 'pending' | 'paid' | 'failed'
  created_at        timestamp   DEFAULT now()
```

---

## Settings Page — Keys Management

```
app/(dashboard)/settings/page.tsx

Sections:

1. ACCOUNT
   - Name, email (from Google — read only)
   - Avatar

2. MODE
   ┌─────────────────────────────────┐
   │  Current Mode: BYOK             │
   │                                 │
   │  [Switch to Subscription →]     │
   │  Or                             │
   │  [Manage Subscription →]        │
   └─────────────────────────────────┘

3. API KEYS (shown only in BYOK mode)
   ┌─────────────────────────────────┐
   │  🔑 YouTube API Key             │
   │  [●●●●●●●●●●●●●AIza]  [Edit]   │
   │  Status: ✅ Working             │
   │                                 │
   │  🤖 Gemini API Key              │
   │  [●●●●●●●●●●●●●●●●]  [Edit]    │
   │  Status: ✅ Working             │
   │                                 │
   │  🗄️ Database URL                │
   │  [postgresql://●●●●●]  [Edit]   │
   │  Status: ✅ Connected           │
   └─────────────────────────────────┘
   
   Each key has:
   - Masked display (show last 4 chars)
   - Edit button → inline input to update
   - Test button → verify the key works
   - Status indicator (working / invalid / not set)

4. NOTIFICATIONS
   - Daily reminder toggle
   - Reminder time picker

5. DANGER ZONE
   - Delete account button
```

---

## Feature Gating — How It Works

```typescript
// lib/featureGate.ts

export async function canUseFeature(
  userId: string,
  feature: 'ai_quiz' | 'transcript_qa' | 'certificate' | 'public_profile'
): Promise<{ allowed: boolean; reason?: string }> {

  const user = await getUserWithKeys(userId)

  // BYOK mode — check if relevant key exists
  if (user.mode === 'byok') {
    if (feature === 'ai_quiz' || feature === 'transcript_qa') {
      if (!user.geminiApiKey && !user.claudeApiKey) {
        return {
          allowed: false,
          reason: 'Add your Gemini API key in Settings to use this feature'
        }
      }
    }
    return { allowed: true }
  }

  // Subscription mode — check plan
  if (user.mode === 'subscription') {
    if (user.plan === 'free' || isPlanExpired(user.planExpiresAt)) {
      return {
        allowed: false,
        reason: 'Upgrade to Pro to use this feature'
      }
    }
    if (user.plan === 'basic' && ['ai_quiz', 'certificate'].includes(feature)) {
      return {
        allowed: false,
        reason: 'This feature requires Pro plan'
      }
    }
    return { allowed: true }
  }

  return { allowed: false }
}
```

### Gating UI Pattern

```tsx
// When a feature is gated, show this instead of the feature:

<GateCard feature="ai_quiz">
  <div className="flex flex-col items-center gap-3 py-6">
    <Lock className="w-8 h-8 text-[--text-muted]" />
    <p className="text-sm text-[--text-secondary]">
      AI Quiz requires a Gemini API key
    </p>
    <button onClick={() => router.push('/settings#api-keys')}>
      Add API Key in Settings →
    </button>
  </div>
</GateCard>

// Or for subscription:
<GateCard>
  <p>Upgrade to Pro to generate certificates</p>
  <button onClick={() => router.push('/pricing')}>
    View Plans →
  </button>
</GateCard>
```

---

## Environment Variables (Add to .env.example)

```bash
# Encryption (for storing user API keys securely)
ENCRYPTION_KEY=                    # 32-byte hex: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Razorpay (subscription payments)
RAZORPAY_KEY_ID=                   # rzp_live_xxx or rzp_test_xxx
RAZORPAY_KEY_SECRET=               # from Razorpay dashboard
NEXT_PUBLIC_RAZORPAY_KEY_ID=       # same as above (needed client-side for checkout)

# Platform API keys (used in subscription mode)
# In BYOK mode, user's own keys are used instead of these
GEMINI_API_KEY=                    # Your Gemini key for subscription users
ANTHROPIC_API_KEY=                 # Your Claude key for subscription users
YOUTUBE_API_KEY=                   # Your YT key for subscription users
```

---

## Pricing Page — `/pricing`

```
Simple, clean pricing page (public, no auth required)

┌──────────────────────────────────────────────────────┐
│                  Simple Pricing                      │
│         Learn consistently, not expensively          │
│                                                      │
│  ┌──────────────┐ ┌──────────────┐ ┌─────────────┐  │
│  │  BYOK        │ │  Basic       │ │  Pro    ⭐  │  │
│  │  Free        │ │  ₹199/mo     │ │  ₹399/mo    │  │
│  │  Forever     │ │              │ │             │  │
│  │              │ │              │ │             │  │
│  │ ✓ All core   │ │ ✓ All core   │ │ ✓ Everything│  │
│  │   features   │ │   features   │ │ ✓ AI Quiz   │  │
│  │ ✓ Your own   │ │ ✓ Hosted DB  │ │ ✓ Q&A Chat  │  │
│  │   API keys   │ │ ✗ AI Quiz    │ │ ✓ Certs     │  │
│  │ ✓ Your own   │ │ ✗ AI Q&A     │ │ ✓ Profile   │  │
│  │   database   │ │ ✗ Certs      │ │ ✓ Support   │  │
│  │              │ │              │ │             │  │
│  │ [Start Free] │ │ [Get Basic]  │ │ [Get Pro]   │  │
│  └──────────────┘ └──────────────┘ └─────────────┘  │
│                                                      │
│  All plans include: No ads · No data selling         │
│  BYOK: Your data stays in your database              │
└──────────────────────────────────────────────────────┘
```

---

## Implementation Order (Phase 9)

```
Week 1 — BYOK Mode:
  Day 1:
    □ Add mode, youtube_api_key, gemini_api_key, byok_database_url to users table
    □ Run migration
    □ Create lib/encrypt.ts (AES-256 encryption)
    □ Add ENCRYPTION_KEY to .env.local

  Day 2:
    □ Mode selection screen on first login
    □ BYOK onboarding flow (3 steps)
    □ API key testing endpoints (/api/keys/test-youtube, /api/keys/test-gemini)
    □ Settings page API Keys section

  Day 3:
    □ lib/userKeys.ts — getUserKeys(), getDbClient()
    □ lib/featureGate.ts — canUseFeature()
    □ Update all API routes to use getUserKeys() instead of process.env directly
    □ Test: BYOK user with own keys → all features work

  Day 4:
    □ GateCard component for locked features
    □ Wire feature gates in: QuizTriggerBanner, TranscriptChat, CertificatePage
    □ Test: BYOK user without keys → sees gate cards with instructions

Week 2 — Subscription Mode:
  Day 5:
    □ npm install razorpay
    □ Razorpay test account setup
    □ /api/payments/create-order route
    □ /api/payments/webhook route (verify signature)

  Day 6:
    □ Pricing page /pricing (public)
    □ Upgrade modal (shown when user hits a gate)
    □ Razorpay checkout integration

  Day 7:
    □ Add plan, plan_expires_at, payments table to schema
    □ Run migration
    □ Test full payment flow in test mode
    □ Subscription management in settings (cancel, view plan)

  Day 8:
    □ Switch Razorpay to live mode
    □ Test with real card (₹1 test transaction)
    □ Final end-to-end test: BYOK + Subscription both working
    □ Update MEMORY.md + deploy
```

---

## Notes for AI Assistants

1. **Encryption is mandatory** for stored API keys — never store plaintext keys in DB
2. **BYOK database** means a separate Drizzle client per user — getDbClient() handles this
3. **Feature gates** should show helpful instructions, not just "upgrade" — BYOK users need key setup help
4. **Razorpay webhook** must verify signature — never trust webhook without verification
5. **In subscription mode** — use platform env var keys, not user's keys
6. **Test Razorpay in test mode first** — rzp_test_ prefix keys, no real money
7. **ENCRYPTION_KEY must never change** after first deploy — changing it breaks all stored keys
8. **Mode selection** happens once on first login — can be changed in settings later
9. **BYOK users pay nothing to you** — but also cost you nothing (their API bills, their DB)
10. **Gemini key in BYOK** — user gets from aistudio.google.com — free, takes 2 minutes
