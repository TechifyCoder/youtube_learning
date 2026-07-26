import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { encrypt } from '@/lib/encrypt'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { youtubeApiKey, geminiApiKey, byokDatabaseUrl } = body

    // Only update fields that were provided (non-empty strings)
    const updates: Record<string, string | null> = {}
    if (youtubeApiKey) updates.youtubeApiKey = encrypt(youtubeApiKey)
    if (geminiApiKey) updates.geminiApiKey = encrypt(geminiApiKey)
    if (byokDatabaseUrl) updates.byokDatabaseUrl = encrypt(byokDatabaseUrl)

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No keys provided' }, { status: 400 })
    }

    await db
      .update(users)
      .set(updates)
      .where(eq(users.id, session.user.id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Update Keys Error]', error)
    return NextResponse.json({ error: 'Failed to update keys' }, { status: 500 })
  }
}
