import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { code } = body

    if (!code || code !== 'LEARN26') {
      return NextResponse.json({ error: 'Invalid coupon code' }, { status: 400 })
    }

    // Check how many users have this coupon applied
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(eq(users.plan, 'coupon_learn26'))
      
    const count = result[0]?.count ?? 0

    if (count >= 100) {
      return NextResponse.json({ error: 'Coupon usage limit reached (100 max)' }, { status: 400 })
    }

    // Apply coupon to user
    await db
      .update(users)
      .set({ plan: 'coupon_learn26' })
      .where(eq(users.id, session.user.id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Coupon Apply Error]', error)
    return NextResponse.json({ error: 'Failed to apply coupon' }, { status: 500 })
  }
}
