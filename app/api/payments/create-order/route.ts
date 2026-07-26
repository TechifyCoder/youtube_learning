import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { payments } from '@/lib/db/schema'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || '',
      key_secret: process.env.RAZORPAY_KEY_SECRET || '',
    })

    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { plan } = body

    if (!['basic', 'pro_monthly', 'pro_annual'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Determine amount in paise
    let amount = 0
    if (plan === 'basic') amount = 19900
    if (plan === 'pro_monthly') amount = 39900
    if (plan === 'pro_annual') amount = 299900

    if (amount < 100) {
      return NextResponse.json({ error: 'Amount must be at least 1 INR' }, { status: 400 })
    }

    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `rcpt_${session.user.id.substring(0, 8)}_${Date.now()}`,
      notes: {
        userId: session.user.id,
        plan,
      },
    })

    // Insert pending payment record
    await db.insert(payments).values({
      userId: session.user.id,
      razorpayOrderId: order.id,
      amountPaise: amount,
      plan: plan,
      status: 'pending',
    })

    return NextResponse.json({
      orderId: order.id,
      amount,
      currency: 'INR',
    })
  } catch (error) {
    console.error('[Create Order Error]', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
