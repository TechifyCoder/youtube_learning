'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface ProfileFormProps {
  initialUsername: string
  initialBio: string
  initialIsPublic: boolean
}

export function ProfileForm({ initialUsername, initialBio, initialIsPublic }: ProfileFormProps) {
  const router = useRouter()
  const [username, setUsername] = useState(initialUsername)
  const [bio, setBio] = useState(initialBio)
  const [isPublic, setIsPublic] = useState(initialIsPublic)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, bio, isPublic }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to update profile')
      } else {
        setSuccess(true)
        router.refresh()
      }
    } catch (err) {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-heading font-semibold text-white mb-4">Profile Settings</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[--text-secondary] mb-1">
              Username
            </label>
            <div className="flex bg-[--bg-primary] border border-white/10 rounded-lg overflow-hidden focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 transition-all">
              <span className="px-3 py-2 text-[--text-secondary] border-r border-white/10 bg-white/5">
                learnloop.app/u/
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="flex-1 bg-transparent border-none px-3 py-2 text-white placeholder-white/20 focus:ring-0"
                placeholder="johndoe"
                pattern="^[a-zA-Z0-9_]+$"
                title="Only letters, numbers, and underscores allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[--text-secondary] mb-1">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-[--bg-primary] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/20 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none h-24"
              placeholder="Tell the world what you're learning..."
              maxLength={160}
            />
            <div className="text-xs text-right text-[--text-secondary] mt-1">
              {bio.length} / 160
            </div>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-white/5 mt-4">
            <div>
              <div className="font-medium text-white">Public Profile</div>
              <div className="text-sm text-[--text-secondary]">Make your stats and certificates visible to others.</div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isPublic}
              onClick={() => setIsPublic(!isPublic)}
              className={`${
                isPublic ? 'bg-purple-600' : 'bg-white/10'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
            >
              <span
                className={`${
                  isPublic ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </button>
          </div>
        </div>
      </div>

      {error && <div className="text-red-400 text-sm">{error}</div>}
      {success && <div className="text-green-400 text-sm">Profile updated successfully!</div>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        Save Changes
      </button>
    </form>
  )
}
