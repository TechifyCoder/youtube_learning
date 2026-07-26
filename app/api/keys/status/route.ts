import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { decrypt } from '@/lib/encrypt'

export const dynamic = 'force-dynamic'

// ─────────────────────────────────────────────────────────────
// GET /api/keys/status
//
// Returns which keys are set for the current user.
// Values are masked — only shows last 4 characters.
// Never returns actual key values.
//
// Response:
// {
//   youtube:  { set: true,  preview: '...Kj9x' },
//   gemini:   { set: true,  preview: '...XyZ1' },
//   database: { set: false, preview: null }
// }
// ─────────────────────────────────────────────────────────────

function maskKey(encryptedValue: string | null | undefined): { set: boolean; preview: string | null } {
  if (!encryptedValue) return { set: false, preview: null }

  try {
    const decrypted = decrypt(encryptedValue)
    if (!decrypted) return { set: false, preview: null }

    // Show last 4 chars for keys, or show DB URL host portion
    if (decrypted.startsWith('postgresql://') || decrypted.startsWith('postgres://')) {
      // For DB URL: show the host part like "postgresql://user:••••@ep-xxx.neon.tech/dbname"
      const match = decrypted.match(/^(postgresql:\/\/[^:]+):([^@]+)@(.+)$/)
      if (match) {
        return { set: true, preview: `${match[1]}:••••@${match[3]}` }
      }
      return { set: true, preview: `${decrypted.slice(0, 20)}...` }
    }

    // For API keys: show "••••••••" + last 4 chars
    const preview = `••••••••${decrypted.slice(-4)}`
    return { set: true, preview }
  } catch {
    return { set: false, preview: null }
  }
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [user] = await db
      .select({
        youtubeApiKey:   users.youtubeApiKey,
        geminiApiKey:    users.geminiApiKey,
        byokDatabaseUrl: users.byokDatabaseUrl,
        onboardingComplete: users.onboardingComplete,
        mode:            users.mode,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1)

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    return Response.json({
      youtube:  maskKey(user.youtubeApiKey),
      gemini:   maskKey(user.geminiApiKey),
      database: maskKey(user.byokDatabaseUrl),
      isDbSetup: user.onboardingComplete,
      mode:     user.mode,
    })
  } catch (error) {
    console.error('[GET /api/keys/status]', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
