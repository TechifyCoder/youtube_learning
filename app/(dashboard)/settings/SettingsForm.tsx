'use client'

import { useState } from 'react'

import { Bell, Trash2, Loader2, Moon } from 'lucide-react'
import { GlassCard } from '@/components/common/GlassCard'
import { toast } from 'react-hot-toast'
import { cn } from '@/lib/utils'

interface SettingsFormProps {
  initialSettings: {
    reminderEnabled: boolean
    reminderTime: string
  }
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [settings, setSettings] = useState(initialSettings)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (newSettings: typeof settings) => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      })

      if (!res.ok) throw new Error('Failed to update')
      
      setSettings(newSettings)
      toast.success('Settings saved')

      // Request notification permission if enabling
      if (newSettings.reminderEnabled && 'Notification' in window) {
        if (Notification.permission !== 'granted') {
          await Notification.requestPermission()
        }
      }
    } catch (err) {
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <GlassCard padding="lg">
        <h2 className="text-lg font-semibold text-[--text-primary] mb-6 flex items-center gap-2">
          <Bell className="w-5 h-5 text-purple-400" />
          Notifications
        </h2>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-[--text-primary]">Daily Reminders</p>
              <p className="text-sm text-[--text-secondary]">Get a notification to keep your learning streak alive.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.reminderEnabled}
              onClick={() => handleSave({ ...settings, reminderEnabled: !settings.reminderEnabled })}
              className={cn(
                settings.reminderEnabled ? 'bg-purple-500' : 'bg-white/[0.1]',
                'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500/50'
              )}
            >
              <span
                className={cn(
                  settings.reminderEnabled ? 'translate-x-6' : 'translate-x-1',
                  'pointer-events-none mt-[2px] inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                )}
              />
            </button>
          </div>

          <div className={cn("transition-opacity duration-200", settings.reminderEnabled ? "opacity-100" : "opacity-50 pointer-events-none")}>
            <label className="block text-sm font-medium text-[--text-secondary] mb-2">
              Reminder Time
            </label>
            <input 
              type="time" 
              value={settings.reminderTime}
              onChange={(e) => setSettings({ ...settings, reminderTime: e.target.value })}
              onBlur={() => handleSave(settings)}
              className="bg-black/40 border border-white/[0.1] focus:border-purple-500/50 rounded-xl px-4 py-2 text-sm text-[--text-primary] outline-none"
            />
          </div>
        </div>
      </GlassCard>

      <GlassCard padding="lg">
        <h2 className="text-lg font-semibold text-[--text-primary] mb-6 flex items-center gap-2">
          <Moon className="w-5 h-5 text-purple-400" />
          Theme
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-[--text-primary]">Dark Mode</p>
            <p className="text-sm text-[--text-secondary]">LearnLoop is currently designed exclusively in dark mode for maximum focus.</p>
          </div>
          <div className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-medium border border-purple-500/20">
            Always On
          </div>
        </div>
      </GlassCard>

      <GlassCard padding="lg" className="border-red-500/20">
        <h2 className="text-lg font-semibold text-red-400 mb-6 flex items-center gap-2">
          <Trash2 className="w-5 h-5" />
          Danger Zone
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-[--text-primary]">Delete Account</p>
            <p className="text-sm text-[--text-secondary]">Permanently delete your account and all data.</p>
          </div>
          <button 
            onClick={() => {
              if (window.confirm('Are you sure? This action cannot be undone.')) {
                toast('Account deletion disabled in demo mode.', { icon: 'ℹ️' })
              }
            }}
            className="bg-red-500/[0.12] hover:bg-red-500/[0.20] border border-red-500/[0.25] text-red-400 font-medium text-sm px-5 py-2.5 rounded-xl transition-all duration-200"
          >
            Delete Account
          </button>
        </div>
      </GlassCard>
    </div>
  )
}
