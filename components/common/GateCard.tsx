'use client'

import React from 'react'
import { Lock, Key } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface GateCardProps {
  /** What feature is locked */
  feature: 'ai_quiz' | 'transcript_qa' | 'certificate' | 'public_profile'
  /** Optional custom reason message */
  reason?: string
  /** How to fix — 'add_key' for BYOK, 'upgrade' for subscription */
  action?: 'add_key' | 'upgrade'
  className?: string
}

const FEATURE_LABELS: Record<GateCardProps['feature'], string> = {
  ai_quiz: 'AI Quiz',
  transcript_qa: 'Transcript Q&A Chat',
  certificate: 'Certificate Generation',
  public_profile: 'Public Profile',
}

export function GateCard({ feature, reason, action, className }: GateCardProps) {
  const router = useRouter()

  const label = FEATURE_LABELS[feature]

  // Determine best action if not explicitly passed
  const resolvedAction = action ?? 'add_key'

  const defaultReason =
    resolvedAction === 'add_key'
      ? `${label} requires a Gemini API key. Add yours in Settings — it's free.`
      : `${label} requires the Pro plan.`

  const displayReason = reason ?? defaultReason

  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-8 text-center ${className ?? ''}`}
    >
      <div className="rounded-full bg-purple-500/10 p-4">
        <Lock className="h-7 w-7 text-purple-400" />
      </div>

      <div className="space-y-1">
        <p className="text-base font-semibold text-foreground">{label} Locked</p>
        <p className="max-w-xs text-sm text-muted-foreground">{displayReason}</p>
      </div>

      {resolvedAction === 'add_key' ? (
        <Button
          variant="ghost"
          className="gap-2 border border-white/10 bg-white/5 hover:bg-white/10"
          onClick={() => router.push('/settings#api-keys')}
        >
          <Key className="h-4 w-4" />
          Add API Key in Settings
        </Button>
      ) : (
        <Button
          variant="default"
          className="bg-gradient-to-r from-purple-600 to-indigo-600 border-0 hover:from-purple-500 hover:to-indigo-500"
          onClick={() => router.push('/pricing')}
        >
          View Plans
        </Button>
      )}
    </div>
  )
}
