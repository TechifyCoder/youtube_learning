import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq, lt, sql } from 'drizzle-orm'

// ─────────────────────────────────────────────────────────────
// Early Access: First 10 users get ALL features free
// No BYOK keys needed, no subscription needed
// ─────────────────────────────────────────────────────────────

const EARLY_ACCESS_LIMIT = 10

export async function isEarlyAccessUser(userId: string): Promise<boolean> {
  try {
    // Get this user's createdAt
    const [user] = await db
      .select({ createdAt: users.createdAt })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!user) return false

    // Count how many users were created before this user
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(lt(users.createdAt, user.createdAt))

    const count = result[0]?.count ?? 0

    // If fewer than EARLY_ACCESS_LIMIT users existed before this user, they are in early access
    return count < EARLY_ACCESS_LIMIT
  } catch {
    return false
  }
}

export async function getTotalUserCount(): Promise<number> {
  try {
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
    return result[0]?.count ?? 0
  } catch {
    return 0
  }
}
