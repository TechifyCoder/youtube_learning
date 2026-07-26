import { auth } from '@/lib/auth'
import { z } from 'zod'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { encrypt } from '@/lib/encrypt'
import { setupUserDatabase } from '@/lib/db/userSetup'
import { clearUserDbCache } from '@/lib/db/getUserDb'

// ─────────────────────────────────────────────────────────────
// POST /api/onboarding/setup-db
// Body: { databaseUrl: string, youtubeKey?: string, geminiKey?: string }
//
// This is called when user clicks "Setup My Database" in Step 3 of onboarding.
// It:
// 1. Validates the database URL
// 2. Runs setupUserDatabase(url) — creates all tables in user's DB
// 3. Encrypts and saves all provided keys to platformDb users table
// 4. Sets onboarding_complete = true
// 5. Returns { success: true }
//
// After this, middleware allows access to /dashboard.
// ─────────────────────────────────────────────────────────────

const bodySchema = z.object({
  databaseUrl: z.string().min(20),
  youtubeKey:  z.string().optional(),
  geminiKey:   z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json() as unknown
    const parsed = bodySchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { databaseUrl, youtubeKey, geminiKey } = parsed.data

    // 1. Run setupUserDatabase — creates all tables in user's Neon DB
    const setup = await setupUserDatabase(databaseUrl)
    if (!setup.success) {
      return Response.json(
        { error: setup.error ?? 'Failed to set up your database. Please check the URL and try again.' },
        { status: 400 }
      )
    }

    // 2. Encrypt and save all keys to platform DB
    const updateData: Record<string, unknown> = {
      byokDatabaseUrl:    encrypt(databaseUrl),
      onboardingComplete: true,
    }

    if (youtubeKey) {
      updateData['youtubeApiKey'] = encrypt(youtubeKey)
    }
    if (geminiKey) {
      updateData['geminiApiKey'] = encrypt(geminiKey)
    }

    await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, session.user.id))

    // 3. Clear the user DB cache (URL may have changed)
    clearUserDbCache(session.user.id)

    return Response.json({ success: true })
  } catch (error) {
    console.error('[POST /api/onboarding/setup-db]', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
