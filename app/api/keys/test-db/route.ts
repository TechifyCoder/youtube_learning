import { auth } from '@/lib/auth'
import { z } from 'zod'
import { testUserDatabase } from '@/lib/db/userSetup'

// ─────────────────────────────────────────────────────────────
// POST /api/keys/test-db
// Body: { databaseUrl: string }
//
// Tests whether a Neon PostgreSQL connection string is valid
// by running SELECT 1 against it.
//
// Used by the "Test Connection" button in onboarding Step 3.
//
// Returns: { valid: true } or { valid: false, error: string }
// ─────────────────────────────────────────────────────────────

const bodySchema = z.object({
  databaseUrl: z.string().min(20),
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

    const { databaseUrl } = parsed.data
    const result = await testUserDatabase(databaseUrl)

    return Response.json({ valid: result.success, error: result.error })
  } catch (error) {
    console.error('[POST /api/keys/test-db]', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
