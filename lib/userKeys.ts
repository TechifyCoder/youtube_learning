import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { decrypt } from './encrypt'
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'

export interface UserKeys {
  mode: string
  youtubeApiKey: string | null
  geminiApiKey: string | null
  databaseUrl: string | null
}

export async function getUserKeys(userId: string): Promise<UserKeys> {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)

  if (!user) {
    throw new Error('User not found')
  }

  // If in subscription mode, use the global platform keys, ignoring BYOK ones
  if (user.mode === 'subscription') {
    return {
      mode: 'subscription',
      youtubeApiKey: process.env.YOUTUBE_API_KEY || null,
      geminiApiKey: process.env.GEMINI_API_KEY || null,
      databaseUrl: null, // Subscription uses the shared database
    }
  }

  // BYOK mode, use their decrypted stored keys
  return {
    mode: 'byok',
    youtubeApiKey: decrypt(user.youtubeApiKey),
    geminiApiKey: decrypt(user.geminiApiKey),
    databaseUrl: decrypt(user.byokDatabaseUrl),
  }
}

// For BYOK database mode — returns the user's personal DB if configured, otherwise falls back to shared DB
export async function getDbClient(userId: string) {
  const { databaseUrl } = await getUserKeys(userId)

  if (databaseUrl) {
    const sql = neon(databaseUrl)
    return drizzle(sql)
  }

  return db
}
