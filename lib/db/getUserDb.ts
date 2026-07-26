import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http'
import { eq } from 'drizzle-orm'
import { platformDb } from './index'
import { users } from './platformSchema'
import { decrypt } from '@/lib/encrypt'
import { userSchema } from './userSchema'

// ─────────────────────────────────────────────────────────────
// getUserDb — Dynamic per-user DB client
//
// Each user has their own Neon PostgreSQL database.
// URL is stored encrypted in the platform DB (users.byok_database_url).
//
// This function:
// 1. Checks an in-memory cache first
// 2. Fetches user's encrypted DB URL from platformDb
// 3. Decrypts it
// 4. Creates a new Drizzle client for that URL
// 5. Caches it for subsequent requests
// ─────────────────────────────────────────────────────────────

type UserDb = NeonHttpDatabase<typeof userSchema>

// In-memory cache — persists across requests in the same serverless instance
// This dramatically reduces reconnection overhead on warm starts
const dbCache = new Map<string, UserDb>()

export async function getUserDb(userId: string): Promise<UserDb> {
  // 1. Check cache first (warm start optimization)
  if (dbCache.has(userId)) {
    return dbCache.get(userId)!
  }

  // 2. Fetch user's encrypted DB URL from platform DB
  const [user] = await platformDb
    .select({ dbUrl: users.neonDatabaseUrl })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user?.dbUrl) {
    // Fallback to platform database for Free Mode users
    const fallbackSql = neon(process.env.DATABASE_URL!)
    const fallbackDb = drizzle(fallbackSql, { schema: userSchema }) as UserDb
    dbCache.set(userId, fallbackDb)
    return fallbackDb
  }

  // 3. Decrypt the URL
  const decryptedUrl = decrypt(user.dbUrl)

  if (!decryptedUrl) {
    throw new Error('USER_DB_DECRYPT_FAILED')
  }

  // 4. Create Drizzle client for user's own Neon DB
  const sql = neon(decryptedUrl)
  const userDb = drizzle(sql, { schema: userSchema }) as UserDb

  // 5. Cache it for this serverless instance lifetime
  dbCache.set(userId, userDb)

  return userDb
}

// Call this when user updates their DB URL (invalidate cache)
export function clearUserDbCache(userId: string): void {
  dbCache.delete(userId)
}

// ─────────────────────────────────────────────────────────────
// handleUserDbError — Standard error response for DB not configured
//
// When getUserDb() throws USER_DB_NOT_CONFIGURED, call this
// to return the proper 503 response telling the frontend to
// redirect to onboarding.
// ─────────────────────────────────────────────────────────────
export function createUserDbErrorResponse(error: unknown): Response {
  if (error instanceof Error && error.message === 'USER_DB_NOT_CONFIGURED') {
    return Response.json(
      {
        error: 'Database not configured',
        code: 'DB_NOT_CONFIGURED',
        redirect: '/onboarding',
      },
      { status: 503 }
    )
  }

  return Response.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}
