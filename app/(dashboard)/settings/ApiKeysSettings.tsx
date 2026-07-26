'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { CheckCircle, XCircle, Loader2, ExternalLink, Eye, EyeOff, Database, Key, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import toast from 'react-hot-toast'

type KeyType = 'youtube' | 'gemini' | 'database'
type TestStatus = 'idle' | 'testing' | 'valid' | 'invalid'

interface KeyStatus {
  set: boolean
  preview: string | null
}

interface KeysData {
  youtube: KeyStatus
  gemini: KeyStatus
  database: KeyStatus
  isDbSetup: boolean
  mode: string
}

interface EditState {
  type: KeyType
  value: string
  saving: boolean
  testStatus: TestStatus
  testError?: string
}

// ─────────────────────────────────────────────────────────────
// ApiKeysSettings — shows current key status + inline editing
// ─────────────────────────────────────────────────────────────

export function ApiKeysSettings() {
  const [keysData, setKeysData] = useState<KeysData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<EditState | null>(null)
  const [showValue, setShowValue] = useState(false)

  const fetchKeyStatus = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/keys/status')
      if (!res.ok) throw new Error('Failed to fetch key status')
      const data = await res.json() as KeysData
      setKeysData(data)
    } catch {
      toast.error('Failed to load API key status')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchKeyStatus()
  }, [fetchKeyStatus])

  const startEditing = (type: KeyType) => {
    setEditing({ type, value: '', saving: false, testStatus: 'idle' })
    setShowValue(false)
  }

  const cancelEditing = () => {
    setEditing(null)
    setShowValue(false)
  }

  const testCurrentKey = async () => {
    if (!editing?.value) return
    setEditing(prev => prev ? { ...prev, testStatus: 'testing', testError: undefined } : null)

    try {
      if (editing.type === 'database') {
        const res = await fetch('/api/keys/test-db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ databaseUrl: editing.value }),
        })
        const data = await res.json() as { valid: boolean; error?: string }
        setEditing(prev => prev ? {
          ...prev,
          testStatus: data.valid ? 'valid' : 'invalid',
          testError: data.valid ? undefined : data.error,
        } : null)
      } else {
        const res = await fetch(`/api/keys/test?type=${editing.type}&key=${encodeURIComponent(editing.value)}`)
        const data = await res.json() as { valid: boolean; error?: string }
        setEditing(prev => prev ? {
          ...prev,
          testStatus: data.valid ? 'valid' : 'invalid',
          testError: data.valid ? undefined : data.error,
        } : null)
      }
    } catch {
      setEditing(prev => prev ? { ...prev, testStatus: 'invalid', testError: 'Test failed' } : null)
    }
  }

  const saveKey = async () => {
    if (!editing?.value) return
    setEditing(prev => prev ? { ...prev, saving: true } : null)

    try {
      // If updating database, also run table setup
      if (editing.type === 'database') {
        const res = await fetch('/api/keys/update', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: editing.type, value: editing.value }),
        })
        if (!res.ok) {
          const data = await res.json() as { error?: string }
          throw new Error(data.error ?? 'Failed to save')
        }
        toast.success('Database URL updated!')
      } else {
        const res = await fetch('/api/keys/update', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: editing.type, value: editing.value }),
        })
        if (!res.ok) {
          const data = await res.json() as { error?: string }
          throw new Error(data.error ?? 'Failed to save')
        }
        const labels: Record<KeyType, string> = {
          youtube: 'YouTube API key',
          gemini: 'Gemini API key',
          database: 'Database URL',
        }
        toast.success(`${labels[editing.type]} updated!`)
      }

      await fetchKeyStatus()
      setEditing(null)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save key')
      setEditing(prev => prev ? { ...prev, saving: false } : null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!keysData) return null

  const keys: Array<{
    type: KeyType
    label: string
    icon: React.ReactNode
    status: KeyStatus
    description: string
    helpUrl: string
    helpLabel: string
    placeholder: string
  }> = [
    {
      type: 'youtube',
      label: 'YouTube Data API v3',
      icon: <Zap className="h-4 w-4 text-red-400" />,
      status: keysData.youtube,
      description: 'Used to fetch playlist and video information from YouTube.',
      helpUrl: 'https://console.cloud.google.com/apis/credentials',
      helpLabel: 'Google Cloud Console',
      placeholder: 'AIzaSy...',
    },
    {
      type: 'gemini',
      label: 'Google Gemini API',
      icon: <Key className="h-4 w-4 text-blue-400" />,
      status: keysData.gemini,
      description: 'Powers quiz generation and AI Q&A features.',
      helpUrl: 'https://aistudio.google.com/app/apikey',
      helpLabel: 'Google AI Studio',
      placeholder: 'AIzaSy...',
    },
    {
      type: 'database',
      label: 'Neon Database',
      icon: <Database className="h-4 w-4 text-purple-400" />,
      status: keysData.database,
      description: 'Your private Neon PostgreSQL database for all learning data.',
      helpUrl: 'https://console.neon.tech',
      helpLabel: 'Neon Console',
      placeholder: 'postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require',
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-white/10">
        <Key className="h-5 w-5 text-purple-400" />
        <h3 className="font-semibold text-sm uppercase tracking-widest text-muted-foreground">
          BYOK API Keys
        </h3>
        {keysData.mode === 'byok' && (
          <span className="ml-auto text-xs bg-green-500/20 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full font-medium">
            Active
          </span>
        )}
      </div>

      <div className="space-y-3">
        {keys.map(({ type, label, icon, status, description, helpUrl, helpLabel, placeholder }) => (
          <div key={type} className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
            {/* Header row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {icon}
                <span className="text-sm font-medium">{label}</span>
              </div>
              <div className="flex items-center gap-2">
                {status.set ? (
                  <span className="flex items-center gap-1 text-xs text-green-400">
                    <CheckCircle className="h-3.5 w-3.5" /> Connected
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-red-400">
                    <XCircle className="h-3.5 w-3.5" /> Not set
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-3 text-xs border border-white/10"
                  onClick={() => editing?.type === type ? cancelEditing() : startEditing(type)}
                >
                  {editing?.type === type ? 'Cancel' : status.set ? 'Update' : 'Add'}
                </Button>
              </div>
            </div>

            {/* Current value preview */}
            {status.set && status.preview && editing?.type !== type && (
              <div className="font-mono text-xs text-muted-foreground bg-white/5 rounded-lg px-3 py-2 truncate">
                {status.preview}
              </div>
            )}

            {/* Description */}
            {!status.set && editing?.type !== type && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}

            {/* Edit form */}
            {editing?.type === type && (
              <div className="space-y-3 pt-1">
                <div className="relative">
                  <Input
                    type={showValue ? 'text' : 'password'}
                    placeholder={placeholder}
                    value={editing.value}
                    onChange={(e) => setEditing(prev => prev ? {
                      ...prev,
                      value: e.target.value,
                      testStatus: 'idle',
                      testError: undefined,
                    } : null)}
                    className="pr-10 font-mono text-sm"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowValue(!showValue)}
                  >
                    {showValue ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Test error */}
                {editing.testError && (
                  <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-red-400 text-xs">
                    {editing.testError}
                  </div>
                )}

                {/* Test success */}
                {editing.testStatus === 'valid' && (
                  <div className="rounded-lg bg-green-500/10 border border-green-500/20 px-3 py-2 text-green-400 text-xs flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5" /> Connection verified!
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <a href={helpUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-400 hover:underline flex items-center gap-1 mr-auto">
                    <ExternalLink className="h-3 w-3" /> Get from {helpLabel}
                  </a>

                  {editing.value && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-3 text-xs border border-white/10"
                      onClick={testCurrentKey}
                      disabled={editing.testStatus === 'testing'}
                    >
                      {editing.testStatus === 'testing' ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                      Test
                    </Button>
                  )}

                  <Button
                    variant="default"
                    size="sm"
                    className="h-7 px-3 text-xs"
                    onClick={saveKey}
                    disabled={!editing.value || editing.saving}
                  >
                    {editing.saving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                    Save
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* DB setup status */}
      {keysData.database.set && !keysData.isDbSetup && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-300">
          ⚠️ Database URL is saved but tables are not yet created. Go to <a href="/onboarding" className="underline">Onboarding</a> to complete setup.
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Keys are encrypted with AES-256-CBC before storing. We can never read your actual keys.
      </p>
    </div>
  )
}
