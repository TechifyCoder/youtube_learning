'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Loader2, Key, Zap, ExternalLink, ChevronRight, ChevronLeft,
  CheckCircle2, Gift, CheckCircle, XCircle, Database, Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import toast from 'react-hot-toast'

type Mode = 'byok' | 'subscription'
type Step = 'mode' | 'byok_youtube' | 'byok_gemini' | 'byok_neon' | 'done'

type TestStatus = 'idle' | 'testing' | 'valid' | 'invalid'

interface TestState {
  status: TestStatus
  error?: string
}

export function OnboardingClient({
  userName,
  isEarlyAccess
}: {
  userName: string
  isEarlyAccess: boolean
}) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('mode')
  const [mode, setMode] = useState<Mode | null>(null)
  const [loading, setLoading] = useState(false)
  const [keys, setKeys] = useState({ youtubeApiKey: '', geminiApiKey: '', byokDatabaseUrl: '' })

  // Test states for each key
  const [ytTest,   setYtTest]   = useState<TestState>({ status: 'idle' })
  const [gemTest,  setGemTest]  = useState<TestState>({ status: 'idle' })
  const [dbTest,   setDbTest]   = useState<TestState>({ status: 'idle' })
  const [dbSetup,  setDbSetup]  = useState(false) // true after "Setup My Database" succeeds

  // ── Test a YouTube or Gemini key ───────────────────────────
  const testApiKey = async (type: 'youtube' | 'gemini', key: string) => {
    if (!key) return

    const setter = type === 'youtube' ? setYtTest : setGemTest
    setter({ status: 'testing' })

    try {
      const res = await fetch(`/api/keys/test?type=${type}&key=${encodeURIComponent(key)}`)
      const data = await res.json() as { valid: boolean; error?: string }

      if (data.valid) {
        setter({ status: 'valid' })
        toast.success(type === 'youtube' ? 'YouTube API key is valid!' : 'Gemini API key is valid!')
      } else {
        setter({ status: 'invalid', error: data.error })
        toast.error(data.error ?? 'Key is invalid')
      }
    } catch {
      setter({ status: 'invalid', error: 'Failed to test key' })
    }
  }

  // ── Test DB connection ─────────────────────────────────────
  const testDbConnection = async () => {
    if (!keys.byokDatabaseUrl) return

    setDbTest({ status: 'testing' })

    try {
      const res = await fetch('/api/keys/test-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ databaseUrl: keys.byokDatabaseUrl }),
      })
      const data = await res.json() as { valid: boolean; error?: string }

      if (data.valid) {
        setDbTest({ status: 'valid' })
        toast.success('Database connected successfully!')
      } else {
        setDbTest({ status: 'invalid', error: data.error })
        toast.error(data.error ?? 'Connection failed')
      }
    } catch {
      setDbTest({ status: 'invalid', error: 'Failed to test connection' })
    }
  }

  // ── Setup user's database (creates all tables) ─────────────
  const setupDatabase = async () => {
    if (!keys.byokDatabaseUrl) return

    setLoading(true)
    try {
      const payload: Record<string, string> = {
        databaseUrl: keys.byokDatabaseUrl,
      }
      if (keys.youtubeApiKey) payload['youtubeKey'] = keys.youtubeApiKey
      if (keys.geminiApiKey) payload['geminiKey'] = keys.geminiApiKey

      const res = await fetch('/api/onboarding/setup-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json() as { success?: boolean; error?: string }

      if (!res.ok || !data.success) {
        toast.error(data.error ?? 'Failed to set up database')
        return
      }

      setDbSetup(true)
      toast.success('Database set up successfully! Tables created.')
    } catch {
      toast.error('An error occurred during database setup')
    } finally {
      setLoading(false)
    }
  }

  // ── Complete onboarding (without DB — save keys only) ──────
  const completeOnboarding = async (finalMode: Mode, skipKeys = false) => {
    setLoading(true)
    try {
      const payload: Record<string, string> = { mode: finalMode }
      if (!skipKeys && finalMode === 'byok') {
        if (keys.youtubeApiKey) payload['youtubeApiKey'] = keys.youtubeApiKey
        if (keys.geminiApiKey) payload['geminiApiKey'] = keys.geminiApiKey
        // Note: byokDatabaseUrl is saved via /api/onboarding/setup-db, not here
      }

      const res = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error('Failed to complete setup')

      if (finalMode === 'subscription') {
        router.push('/pricing')
      } else {
        setStep('done')
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // ── Helper: Test Status Badge ──────────────────────────────
  const TestBadge = ({ state }: { state: TestState }) => {
    if (state.status === 'valid') {
      return (
        <span className="flex items-center gap-1 text-xs text-green-400 font-medium">
          <CheckCircle className="h-3.5 w-3.5" /> Verified
        </span>
      )
    }
    if (state.status === 'invalid') {
      return (
        <span className="flex items-center gap-1 text-xs text-red-400 font-medium">
          <XCircle className="h-3.5 w-3.5" /> Invalid
        </span>
      )
    }
    return null
  }

  // ── Step: Mode Selection ────────────────────────────────────
  if (step === 'mode') {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <p className="text-3xl font-bold mb-2">Welcome, {userName?.split(' ')[0] ?? 'there'}! 👋</p>
          <p className="text-muted-foreground text-base max-w-md mx-auto">
            LearnLoop helps you track your YouTube learning journey. Let's get you set up in under a minute.
          </p>
        </div>

        {isEarlyAccess && (
          <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
            <Gift className="h-5 w-5 text-amber-400 shrink-0" />
            <span className="text-amber-200">
              <strong>🎉 Early Access!</strong> You're one of our first users — everything is <strong>completely free</strong> for you, forever. No keys needed!
            </span>
          </div>
        )}

        <p className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-widest">Choose how you want to use LearnLoop</p>

        <div className="grid md:grid-cols-2 gap-4">
          {/* BYOK */}
          <button
            onClick={() => { setMode('byok'); setStep('byok_youtube') }}
            className="relative flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 text-left hover:border-purple-500/40 hover:bg-purple-500/5 transition-all group"
          >
            <div className="rounded-xl bg-white/10 p-3 w-fit">
              <Key className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-lg font-bold mb-1">BYOK Mode</p>
              <p className="text-xs font-semibold text-green-400 mb-2">FREE FOREVER</p>
              <p className="text-sm text-muted-foreground">
                Use your own free API keys from Google. Your data stays in your control. Takes 5 minutes to set up.
              </p>
            </div>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-400" /> All features unlocked with your own keys</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-400" /> Free YouTube + Gemini keys</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-400" /> Full privacy — your data in your DB</li>
            </ul>
            <div className="flex items-center gap-1 text-sm font-medium text-purple-400 group-hover:gap-2 transition-all">
              Get started <ChevronRight className="h-4 w-4" />
            </div>
          </button>

          {/* Subscription */}
          <button
            onClick={() => completeOnboarding('subscription')}
            disabled={loading}
            className="relative flex flex-col gap-4 rounded-2xl border border-purple-500/30 bg-purple-500/5 p-6 text-left hover:border-purple-500/60 hover:bg-purple-500/10 transition-all group"
          >
            <div className="absolute top-4 right-4 text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-2 py-0.5 rounded-full">
              7-day free trial
            </div>
            <div className="rounded-xl bg-purple-500/20 p-3 w-fit">
              <Zap className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-lg font-bold mb-1">Subscription Mode</p>
              <p className="text-xs font-semibold text-purple-400 mb-2">₹199–₹399/month</p>
              <p className="text-sm text-muted-foreground">
                Zero setup. We handle everything. Just sign in and start learning.
              </p>
            </div>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-purple-400" /> No API keys needed</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-purple-400" /> Hosted by us, zero setup</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-purple-400" /> 7-day free trial, cancel anytime</li>
            </ul>
            <div className="flex items-center gap-1 text-sm font-medium text-purple-400 group-hover:gap-2 transition-all">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>View plans <ChevronRight className="h-4 w-4" /></>}
            </div>
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          You can always change this in Settings later.
        </p>
      </div>
    )
  }

  // ── Step: BYOK YouTube Key ──────────────────────────────────
  if (step === 'byok_youtube') {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <button onClick={() => setStep('mode')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-4 w-4" /> Back
        </button>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Step 1 of 3</span>
          </div>
          <h2 className="text-2xl font-bold">Connect YouTube</h2>
          <p className="text-muted-foreground mt-1">
            So we can fetch your playlists and video details.
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3 text-sm">
          <p className="font-semibold">How to get your free YouTube API Key:</p>
          <ol className="space-y-2 text-muted-foreground list-decimal list-inside">
            <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-purple-400 underline underline-offset-2 hover:text-purple-300 inline-flex items-center gap-1">Google Cloud Console <ExternalLink className="h-3 w-3" /></a></li>
            <li>Create a project → Enable <strong>YouTube Data API v3</strong></li>
            <li>Go to <strong>Credentials → Create API Key</strong></li>
            <li>Copy the key and paste below</li>
          </ol>
          <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" className="w-full border border-white/10 gap-2 mt-1">
              <ExternalLink className="h-4 w-4" /> Open Google Cloud Console
            </Button>
          </a>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">YouTube API Key</label>
            <TestBadge state={ytTest} />
          </div>
          <Input
            type="password"
            placeholder="AIzaSy..."
            value={keys.youtubeApiKey}
            onChange={(e) => {
              setKeys({ ...keys, youtubeApiKey: e.target.value })
              setYtTest({ status: 'idle' })
            }}
          />
          {ytTest.error && <p className="text-xs text-red-400">{ytTest.error}</p>}
        </div>

        <div className="flex gap-3">
          {keys.youtubeApiKey && (
            <Button
              variant="ghost"
              className="border border-white/10"
              onClick={() => testApiKey('youtube', keys.youtubeApiKey)}
              disabled={ytTest.status === 'testing'}
            >
              {ytTest.status === 'testing' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Test Key
            </Button>
          )}
          <Button
            variant="ghost"
            className="flex-1 border border-white/10"
            onClick={() => setStep('byok_gemini')}
          >
            Skip for now
          </Button>
          <Button
            variant="default"
            className="flex-1"
            onClick={() => setStep('byok_gemini')}
            disabled={!keys.youtubeApiKey}
          >
            Next → Gemini Key
          </Button>
        </div>
      </div>
    )
  }

  // ── Step: BYOK Gemini Key ────────────────────────────────────
  if (step === 'byok_gemini') {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <button onClick={() => setStep('byok_youtube')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-4 w-4" /> Back
        </button>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Step 2 of 3</span>
          </div>
          <h2 className="text-2xl font-bold">Connect AI Features</h2>
          <p className="text-muted-foreground mt-1">
            For quiz generation after videos. Free from Google.
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3 text-sm">
          <p className="font-semibold">How to get your free Gemini API Key:</p>
          <ol className="space-y-2 text-muted-foreground list-decimal list-inside">
            <li>Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-purple-400 underline underline-offset-2 hover:text-purple-300 inline-flex items-center gap-1">Google AI Studio <ExternalLink className="h-3 w-3" /></a></li>
            <li>Click <strong>&quot;Get API Key&quot;</strong> → Create API key</li>
            <li>Paste it below</li>
          </ol>
          <div className="rounded-lg bg-green-500/10 border border-green-500/20 px-3 py-2 text-green-400 text-xs">
            ✓ Free tier: 1500 requests/day — more than enough!
          </div>
          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" className="w-full border border-white/10 gap-2 mt-1">
              <ExternalLink className="h-4 w-4" /> Open Google AI Studio
            </Button>
          </a>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Gemini API Key</label>
            <TestBadge state={gemTest} />
          </div>
          <Input
            type="password"
            placeholder="AIzaSy..."
            value={keys.geminiApiKey}
            onChange={(e) => {
              setKeys({ ...keys, geminiApiKey: e.target.value })
              setGemTest({ status: 'idle' })
            }}
          />
          {gemTest.error && <p className="text-xs text-red-400">{gemTest.error}</p>}
        </div>

        <div className="flex gap-3">
          {keys.geminiApiKey && (
            <Button
              variant="ghost"
              className="border border-white/10"
              onClick={() => testApiKey('gemini', keys.geminiApiKey)}
              disabled={gemTest.status === 'testing'}
            >
              {gemTest.status === 'testing' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Test Key
            </Button>
          )}
          <Button
            variant="ghost"
            className="flex-1 border border-white/10"
            onClick={() => setStep('byok_neon')}
          >
            Skip — I'll add later
          </Button>
          <Button
            variant="default"
            className="flex-1"
            onClick={() => setStep('byok_neon')}
            disabled={!keys.geminiApiKey}
          >
            Next → Database
          </Button>
        </div>
      </div>
    )
  }

  // ── Step: BYOK Neon Database ─────────────────────────────────
  if (step === 'byok_neon') {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <button onClick={() => setStep('byok_gemini')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-4 w-4" /> Back
        </button>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Step 3 of 3</span>
          </div>
          <h2 className="text-2xl font-bold">Your Private Database</h2>
          <p className="text-muted-foreground mt-1">
            Your learning data stays in YOUR database. We never see it.
          </p>
        </div>

        {/* Privacy highlight */}
        <div className="flex items-center gap-3 rounded-xl border border-purple-500/20 bg-purple-500/5 px-4 py-3 text-sm">
          <Shield className="h-5 w-5 text-purple-400 shrink-0" />
          <span className="text-purple-200">
            <strong>Complete data ownership.</strong> Your playlists, progress, and activity are stored in your own Neon database — not ours.
          </span>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3 text-sm">
          <p className="font-semibold flex items-center gap-2"><Database className="h-4 w-4 text-purple-400" /> How to get your free Neon Database URL:</p>
          <ol className="space-y-2 text-muted-foreground list-decimal list-inside">
            <li>Go to <a href="https://neon.tech" target="_blank" rel="noopener noreferrer" className="text-purple-400 underline underline-offset-2 hover:text-purple-300 inline-flex items-center gap-1">neon.tech <ExternalLink className="h-3 w-3" /></a> → Sign up free</li>
            <li>Click <strong>&quot;New Project&quot;</strong> → give it any name</li>
            <li>Go to <strong>&quot;Connection Details&quot;</strong></li>
            <li>Select <strong>&quot;Pooled connection&quot;</strong></li>
            <li>Copy the connection string and paste below</li>
          </ol>
          <a href="https://console.neon.tech/app/projects" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" className="w-full border border-white/10 gap-2 mt-1">
              <ExternalLink className="h-4 w-4" /> Open Neon Console
            </Button>
          </a>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Connection String</label>
            <TestBadge state={dbTest} />
          </div>
          <Input
            type="password"
            placeholder="postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require"
            value={keys.byokDatabaseUrl}
            onChange={(e) => {
              setKeys({ ...keys, byokDatabaseUrl: e.target.value })
              setDbTest({ status: 'idle' })
              setDbSetup(false)
            }}
          />
          {dbTest.error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-red-400 text-xs">
              {dbTest.error}
              {dbTest.error.includes('SSL') && (
                <span className="block mt-1 font-medium">→ Add <code className="bg-red-500/20 px-1 rounded">?sslmode=require</code> to the end of your URL</span>
              )}
            </div>
          )}
          {dbSetup && (
            <div className="rounded-lg bg-green-500/10 border border-green-500/20 px-3 py-2 text-green-400 text-xs flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Database set up! All tables created. Redirecting to dashboard...
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            {keys.byokDatabaseUrl && !dbSetup && (
              <Button
                variant="ghost"
                className="border border-white/10"
                onClick={testDbConnection}
                disabled={dbTest.status === 'testing'}
              >
                {dbTest.status === 'testing' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Test Connection
              </Button>
            )}
            <Button
              variant="default"
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 border-0"
              onClick={setupDatabase}
              disabled={loading || !keys.byokDatabaseUrl || dbSetup}
            >
              {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Setting up...</> : dbSetup ? '✓ Database Ready' : 'Setup My Database →'}
            </Button>
          </div>

          {dbSetup && (
            <Button
              variant="default"
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 border-0"
              onClick={() => router.push('/dashboard')}
            >
              Go to Dashboard →
            </Button>
          )}

          <Button
            variant="ghost"
            className="w-full text-muted-foreground text-xs"
            onClick={() => completeOnboarding('byok', false)}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Skip — Set up database later in Settings
          </Button>
        </div>
      </div>
    )
  }

  // ── Step: Done ────────────────────────────────────────────────
  if (step === 'done') {
    return (
      <div className="max-w-md mx-auto text-center space-y-6">
        <div className="rounded-full bg-green-500/20 p-6 w-fit mx-auto">
          <CheckCircle2 className="h-12 w-12 text-green-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-2">You're all set! 🎉</h2>
          <p className="text-muted-foreground">
            LearnLoop is ready to go. Start by importing a YouTube playlist or video.
          </p>
        </div>
        <div className="space-y-3">
          <Button
            variant="default"
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 border-0"
            onClick={() => router.push('/import')}
          >
            Import my first course →
          </Button>
          <Button
            variant="ghost"
            className="w-full border border-white/10"
            onClick={() => router.push('/dashboard')}
          >
            Go to Dashboard
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          You can update your API keys anytime in <a href="/settings" className="text-purple-400 hover:underline">Settings</a>
        </p>
      </div>
    )
  }

  return null
}
