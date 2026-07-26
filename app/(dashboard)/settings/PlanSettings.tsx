'use client'

import React, { useState } from 'react'
import { GlassCard } from '@/components/common/GlassCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { Loader2, Key, CreditCard, CheckCircle2 } from 'lucide-react'



export function PlanSettings({
  mode,
  plan,
  planExpiresAt,
  hasYoutubeKey,
  hasGeminiKey,
  hasDbUrl
}: {
  mode: string
  plan: string
  planExpiresAt: Date | null
  hasYoutubeKey: boolean
  hasGeminiKey: boolean
  hasDbUrl: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [keys, setKeys] = useState({
    youtubeApiKey: '',
    geminiApiKey: '',
    byokDatabaseUrl: ''
  })

  const handleSaveKeys = async () => {
    // Only send fields that have a value
    const payload: Record<string, string> = {}
    if (keys.youtubeApiKey) payload.youtubeApiKey = keys.youtubeApiKey
    if (keys.geminiApiKey) payload.geminiApiKey = keys.geminiApiKey
    if (keys.byokDatabaseUrl) payload.byokDatabaseUrl = keys.byokDatabaseUrl

    if (Object.keys(payload).length === 0) {
      toast.error('Please enter at least one key to save.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/settings/update-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Failed to save keys')
      toast.success('Keys saved and encrypted!')
      setKeys({ youtubeApiKey: '', geminiApiKey: '', byokDatabaseUrl: '' })
      router.refresh()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSwitchMode = async (newMode: string) => {
    if (newMode === 'subscription') {
      router.push('/pricing')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/settings/update-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: newMode })
      })
      if (!res.ok) throw new Error('Failed to update mode')
      toast.success('Switched to BYOK Mode')
      router.refresh()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const [couponCode, setCouponCode] = useState('')

  const handleApplyCoupon = async () => {
    if (!couponCode) return
    setLoading(true)
    try {
      const res = await fetch('/api/user/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode })
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to apply coupon')
      
      toast.success('Coupon applied successfully! AI features unlocked.')
      setCouponCode('')
      router.refresh()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const isSubscription = mode === 'subscription'
  const isPro = plan === 'pro'
  const isCoupon = plan === 'coupon_learn26'
  const isExpired = planExpiresAt ? new Date(planExpiresAt) < new Date() : false

  return (
    <div className="space-y-6">

      {/* ── Current Mode & Plan ─────────────────────────────────── */}
      <GlassCard className="p-6 space-y-4">
        <div className="flex items-center gap-3 mb-1">
          <CreditCard className="h-5 w-5 text-purple-400" />
          <h2 className="text-lg font-semibold">Plan & Mode</h2>
        </div>

        {isSubscription ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-3">
              <CheckCircle2 className="h-5 w-5 text-purple-400 shrink-0" />
              <div>
                <p className="font-medium capitalize text-foreground">
                  {isPro ? 'Pro Plan' : plan === 'basic' ? 'Basic Plan' : 'Free Plan'}
                  {isExpired && <span className="ml-2 text-xs text-destructive">(Expired)</span>}
                </p>
                {planExpiresAt && !isExpired && (
                  <p className="text-xs text-muted-foreground">
                    Renews {new Date(planExpiresAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="default"
                onClick={() => router.push('/pricing')}
                disabled={loading}
              >
                {isExpired ? 'Renew Plan' : 'Upgrade / Change Plan'}
              </Button>
              <Button
                variant="ghost"
                className="border border-white/10"
                onClick={() => handleSwitchMode('byok')}
                disabled={loading}
              >
                Switch to BYOK (Free)
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <Key className="h-5 w-5 text-muted-foreground shrink-0" />
              <div>
                <p className="font-medium text-foreground">BYOK Mode — Free Forever</p>
                <p className="text-xs text-muted-foreground">
                  You control your own API keys and data
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="border border-purple-500/40 text-purple-400 hover:bg-purple-500/10"
              onClick={() => handleSwitchMode('subscription')}
              disabled={loading}
            >
              View Subscription Plans →
            </Button>
          </div>
        )}
      </GlassCard>

      {/* ── API Keys Section (BYOK only) ────────────────────────── */}
      {!isSubscription && (
        <GlassCard className="p-6 space-y-5" id="api-keys">
          <div className="flex items-center gap-3 mb-1">
            <Key className="h-5 w-5 text-purple-400" />
            <h2 className="text-lg font-semibold">API Keys</h2>
          </div>
          <p className="text-sm text-muted-foreground -mt-2">
            All keys are encrypted with AES-256 before storing. Leave blank to keep existing values.
          </p>

          <div className="space-y-4">
            {/* YouTube API Key */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <label className="font-medium">YouTube API Key</label>
                {hasYoutubeKey && (
                  <span className="flex items-center gap-1 text-xs text-green-400">
                    <CheckCircle2 className="h-3 w-3" /> Configured
                  </span>
                )}
              </div>
              <Input
                type="password"
                placeholder={hasYoutubeKey ? '••••••••••••• (leave blank to keep)' : 'AIza…'}
                value={keys.youtubeApiKey}
                onChange={(e) => setKeys({ ...keys, youtubeApiKey: e.target.value })}
              />
            </div>

            {/* Gemini API Key */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <label className="font-medium">Gemini API Key <span className="text-purple-400">(Required for AI features)</span></label>
                {hasGeminiKey && (
                  <span className="flex items-center gap-1 text-xs text-green-400">
                    <CheckCircle2 className="h-3 w-3" /> Configured
                  </span>
                )}
              </div>
              <Input
                type="password"
                placeholder={hasGeminiKey ? '••••••••••••• (leave blank to keep)' : 'Get free from aistudio.google.com'}
                value={keys.geminiApiKey}
                onChange={(e) => setKeys({ ...keys, geminiApiKey: e.target.value })}
              />
            </div>

            {/* Neon Database URL */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <label className="font-medium">Neon Database URL <span className="text-muted-foreground">(optional)</span></label>
                {hasDbUrl && (
                  <span className="flex items-center gap-1 text-xs text-green-400">
                    <CheckCircle2 className="h-3 w-3" /> Configured
                  </span>
                )}
              </div>
              <Input
                type="password"
                placeholder={hasDbUrl ? 'postgresql://••••••• (leave blank to keep)' : 'postgresql://user:pass@host/db'}
                value={keys.byokDatabaseUrl}
                onChange={(e) => setKeys({ ...keys, byokDatabaseUrl: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to use our shared database. Your data stays private regardless.
              </p>
            </div>
          </div>

          <Button
            variant="default"
            onClick={handleSaveKeys}
            disabled={loading}
            className="w-full"
          >
            {loading
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
              : 'Save & Encrypt Keys'
            }
          </Button>
        </GlassCard>
      )}

      {/* ── Coupon Section ─────────────────────────────────────────── */}
      <GlassCard className="p-6 space-y-5">
        <div className="flex items-center gap-3 mb-1">
          <CreditCard className="h-5 w-5 text-purple-400" />
          <h2 className="text-lg font-semibold">Redeem Coupon</h2>
        </div>
        
        {isCoupon ? (
           <div className="flex items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3">
             <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
             <div>
               <p className="font-medium text-green-100">Coupon Applied</p>
               <p className="text-xs text-green-200/70">
                 You have unlocked premium AI features for free!
               </p>
             </div>
           </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground -mt-2">
              Have a secret coupon code? Enter it below to unlock premium AI features for free!
            </p>

            <div className="flex gap-3">
              <Input
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="max-w-md"
              />
              <Button
                variant="default"
                onClick={handleApplyCoupon}
                disabled={loading || !couponCode}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
              </Button>
            </div>
          </>
        )}
      </GlassCard>
    </div>
  )
}

