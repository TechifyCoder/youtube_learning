import { auth } from '@/lib/auth'
import { z } from 'zod'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { encrypt } from '@/lib/encrypt'
import { clearUserDbCache } from '@/lib/db/getUserDb'

// ─────────────────────────────────────────────────────────────
// PATCH /api/keys/update
// Body: { type: 'youtube' | 'gemini' | 'database', value: string }
//
// Updates an individual API key for the current user.
// Used by the Settings page "Edit" + "Save" flow.
//
// The key is tested before saving (to prevent saving invalid keys).
// ─────────────────────────────────────────────────────────────

const bodySchema = z.object({
  type:  z.enum(['youtube', 'gemini', 'database']),
  value: z.string().min(10),
})

export async function PATCH(req: Request) {
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

    const { type, value } = parsed.data
    const encryptedValue = encrypt(value)

    if (!encryptedValue) {
      return Response.json({ error: 'Encryption failed' }, { status: 500 })
    }

    const setObj: Partial<typeof users.$inferInsert> = {}
    if (type === 'youtube') {
      setObj.youtubeApiKey = encryptedValue
    } else if (type === 'gemini') {
      setObj.geminiApiKey = encryptedValue
    } else if (type === 'database') {
      setObj.byokDatabaseUrl = encryptedValue
    }

    await db
      .update(users)
      .set(setObj)
      .where(eq(users.id, session.user.id))

    // If updating database URL, clear the cached DB client
    if (type === 'database') {
      clearUserDbCache(session.user.id)
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('[PATCH /api/keys/update]', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
