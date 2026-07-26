import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { payments, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Verify signature
    const secret = process.env.RAZORPAY_KEY_SECRET!
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      // Signature mismatch
      await db
        .update(payments)
        .set({ status: 'failed' })
        .where(eq(payments.razorpayOrderId, razorpay_order_id))
        
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    // Signature matches, update payment status
    await db
      .update(payments)
      .set({
        razorpayPaymentId: razorpay_payment_id,
        status: 'paid',
      })
      .where(eq(payments.razorpayOrderId, razorpay_order_id))

    // Update user's plan
    // Calculate expiry (1 month or 1 year)
    let planExpiresAt: Date | null = new Date()
    if (plan === 'pro_monthly' || plan === 'basic') {
      planExpiresAt.setMonth(planExpiresAt.getMonth() + 1)
    } else if (plan === 'pro_annual') {
      planExpiresAt.setFullYear(planExpiresAt.getFullYear() + 1)
    } else {
      planExpiresAt = null // fallback
    }

    await db
      .update(users)
      .set({
        mode: 'subscription',
        plan: plan.startsWith('pro') ? 'pro' : plan,
        planExpiresAt: planExpiresAt,
      })
      .where(eq(users.id, session.user.id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Verify Payment Error]', error)
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 })
  }
}
