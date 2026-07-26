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
    const { mode, youtubeApiKey, geminiApiKey } = body

    if (!mode || !['byok', 'subscription'].includes(mode)) {
      return NextResponse.json({ error: 'Invalid mode' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {
      mode,
      onboardingComplete: true,
    }

    // If BYOK and keys provided, encrypt and save them
    if (mode === 'byok') {
      if (youtubeApiKey) updateData.youtubeApiKey = encrypt(youtubeApiKey)
      if (geminiApiKey) updateData.geminiApiKey = encrypt(geminiApiKey)
    }

    await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, session.user.id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Onboarding Complete Error]', error)
    return NextResponse.json({ error: 'Failed to complete onboarding' }, { status: 500 })
  }
}
