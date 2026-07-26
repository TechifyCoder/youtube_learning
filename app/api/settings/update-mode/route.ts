import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { mode } = await req.json()
    
    if (mode !== 'byok' && mode !== 'subscription') {
      return NextResponse.json({ error: 'Invalid mode' }, { status: 400 })
    }

    await db
      .update(users)
      .set({ mode })
      .where(eq(users.id, session.user.id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Update Mode Error]', error)
    return NextResponse.json({ error: 'Failed to update mode' }, { status: 500 })
  }
}
