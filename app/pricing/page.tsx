'use client'

import React, { useState } from 'react'
import { Check, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/common/GlassCard'
import Script from 'next/script'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function PricingPage() {
  const router = useRouter()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const handlePayment = async (plan: string) => {
    try {
      setLoadingPlan(plan)
      
      // 1. Create order on backend
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create order')
      }

      // 2. Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Use public key
        amount: data.amount,
        currency: data.currency,
        name: 'LearnLoop',
        description: `Subscription: ${plan}`,
        order_id: data.orderId,
        handler: async function (response: any) {
          // 3. Verify signature on backend
          try {
            const verifyRes = await fetch('/api/payments/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan: plan
              })
            })
            
            const verifyData = await verifyRes.json()
            
            if (verifyData.success) {
              toast.success('Payment successful! Welcome to Pro.')
              router.push('/dashboard')
              router.refresh()
            } else {
              toast.error(verifyData.error || 'Payment verification failed')
            }
          } catch (err) {
            toast.error('Payment verification failed')
            console.error(err)
          }
        },
        theme: {
          color: '#8b5cf6' // Purple theme matching app
        }
      }

      const rzp = new (window as any).Razorpay(options)
      
      rzp.on('payment.failed', function (response: any) {
        toast.error(`Payment failed: ${response.error.description}`)
      })
      
      rzp.open()
      
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong')
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div className="min-h-screen py-20 px-6 max-w-6xl mx-auto flex flex-col items-center">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Simple Pricing</h1>
        <p className="text-xl text-muted-foreground">Learn consistently, not expensively</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 w-full">
        {/* BYOK Plan */}
        <GlassCard padding="lg" variant="subtle" className="flex flex-col">
          <div className="mb-6">
            <h3 className="text-2xl font-bold mb-2">BYOK</h3>
            <p className="text-sm text-muted-foreground mb-4">Bring Your Own Keys</p>
            <div className="text-3xl font-bold">Free <span className="text-lg text-muted-foreground font-normal">forever</span></div>
          </div>
          
          <div className="flex-grow space-y-4 mb-8">
            <Feature check text="All core features" />
            <Feature check text="Your own API keys" />
            <Feature check text="Your own database" />
            <Feature check={false} text="No setup required" />
          </div>
          
          <Button variant="ghost" className="w-full bg-white/5 border border-white/10" onClick={() => router.push('/dashboard')}>
            Start Free
          </Button>
        </GlassCard>

        {/* Basic Plan */}
        <GlassCard padding="lg" variant="subtle" className="flex flex-col relative border-purple-500/20">
          <div className="mb-6">
            <h3 className="text-2xl font-bold mb-2">Basic</h3>
            <p className="text-sm text-muted-foreground mb-4">Hosted tracking</p>
            <div className="text-3xl font-bold">₹199 <span className="text-lg text-muted-foreground font-normal">/mo</span></div>
          </div>
          
          <div className="flex-grow space-y-4 mb-8">
            <Feature check text="All core features" />
            <Feature check text="Hosted Database" />
            <Feature check={false} text="AI Quiz" />
            <Feature check={false} text="AI Q&A Chat" />
            <Feature check={false} text="Certificates" />
          </div>
          
          <Button 
            variant="default" 
            className="w-full" 
            onClick={() => handlePayment('basic')}
            disabled={loadingPlan !== null}
          >
            {loadingPlan === 'basic' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Get Basic'}
          </Button>
        </GlassCard>

        {/* Pro Plan */}
        <GlassCard padding="lg" variant="elevated" className="flex flex-col relative border-purple-500/50 shadow-[0_0_30px_-5px_rgba(139,92,246,0.3)]">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-indigo-500 px-4 py-1 rounded-full text-xs font-semibold text-white">
            RECOMMENDED ⭐
          </div>
          <div className="mb-6 mt-2">
            <h3 className="text-2xl font-bold mb-2">Pro</h3>
            <p className="text-sm text-muted-foreground mb-4">Full AI Learning Suite</p>
            <div className="text-3xl font-bold">₹399 <span className="text-lg text-muted-foreground font-normal">/mo</span></div>
          </div>
          
          <div className="flex-grow space-y-4 mb-8">
            <Feature check text="Everything in Basic" />
            <Feature check text="AI Quiz Generation" />
            <Feature check text="AI Transcript Q&A" />
            <Feature check text="Certificates & Profile" />
            <Feature check text="Priority Support" />
          </div>
          
          <Button 
            variant="default" 
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 border-0" 
            onClick={() => handlePayment('pro_monthly')}
            disabled={loadingPlan !== null}
          >
            {loadingPlan === 'pro_monthly' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Get Pro'}
          </Button>
        </GlassCard>
      </div>
      
      <div className="mt-16 text-center text-sm text-muted-foreground space-y-2">
        <p>All plans include: No ads · No data selling</p>
        <p>BYOK: Your data stays completely in your own database</p>
      </div>
    </div>
  )
}

function Feature({ check, text }: { check: boolean, text: string }) {
  return (
    <div className="flex items-center gap-3">
      {check ? (
        <div className="rounded-full bg-purple-500/20 p-1">
          <Check className="w-4 h-4 text-purple-400" />
        </div>
      ) : (
        <div className="rounded-full bg-white/5 p-1">
          <X className="w-4 h-4 text-muted-foreground/50" />
        </div>
      )}
      <span className={check ? "text-foreground" : "text-muted-foreground"}>{text}</span>
    </div>
  )
}
