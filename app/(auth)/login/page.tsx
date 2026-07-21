'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Play, CheckCircle } from 'lucide-react'

// ─────────────────────────────────────────────────────────────
// Login Page — /login
// Dark glassmorphism card, Google OAuth sign-in
// ─────────────────────────────────────────────────────────────

export default function LoginPage() {
  const [loading, setLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      await signIn('google', { callbackUrl: '/dashboard' })
    } catch {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[--bg-primary] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-purple-600/[0.15] blur-[100px]" />
        <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full bg-violet-500/[0.12] blur-[80px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-blue-600/[0.06] blur-[60px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-md"
      >
        {/* Glass Card */}
        <div className="bg-white/[0.05] backdrop-blur-xl border border-white/[0.10] rounded-3xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">

          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center shadow-[0_0_20px_rgba(124,92,252,0.4)]">
              <span className="text-white font-heading font-bold text-sm">LL</span>
            </div>
            <span className="font-heading font-bold text-xl text-[--text-primary]">
              LearnLoop
            </span>
          </div>

          {/* Headline */}
          <div className="mb-8">
            <h1 className="font-heading font-bold text-display text-[--text-primary] mb-3">
              Learn consistently,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-400">
                not just occasionally.
              </span>
            </h1>
            <p className="text-body text-[--text-secondary]">
              Import YouTube playlists, set a deadline, and track exactly what you've watched — down to the second.
            </p>
          </div>

          {/* Feature bullets */}
          <div className="space-y-2.5 mb-8">
            {[
              { icon: Play,         text: 'Red/green progress bar — track every second watched' },
              { icon: BookOpen,     text: 'Auto-schedule: know exactly what to watch today' },
              { icon: CheckCircle,  text: 'Ask AI questions about any video using its transcript' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-body-sm text-[--text-secondary]">
                <div className="w-6 h-6 rounded-lg bg-purple-500/[0.15] flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-purple-400" />
                </div>
                {text}
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="h-px bg-white/[0.06] mb-6" />

          {/* Sign in button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-900 font-medium text-sm px-5 py-3 rounded-xl transition-all duration-200 hover:shadow-lg active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            {loading ? 'Signing in...' : 'Continue with Google'}
          </button>

          {/* Fine print */}
          <p className="text-center text-caption text-[--text-muted] mt-4">
            Free to use · No email/password needed
          </p>
        </div>
      </motion.div>
    </main>
  )
}

// ─── Google Icon SVG ─────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2a10.3 10.3 0 0 0-.16-1.84H9v3.48h4.84A4.14 4.14 0 0 1 12.1 13v2.23h2.86A8.6 8.6 0 0 0 17.64 9.2z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.47-.8 5.96-2.18L12.1 13.6a5.43 5.43 0 0 1-8.08-2.85H1.07v2.3A9 9 0 0 0 9 18z" fill="#34A853" />
      <path d="M4.02 10.71A5.41 5.41 0 0 1 3.74 9c0-.59.1-1.17.28-1.71V5h-2.95A9 9 0 0 0 0 9c0 1.45.35 2.82.97 4.02l3.05-2.31z" fill="#FBBC05" />
      <path d="M9 3.58c1.32 0 2.5.45 3.44 1.35L14.7 2.67A9 9 0 0 0 1.07 5l2.95 2.29A5.43 5.43 0 0 1 9 3.58z" fill="#EA4335" />
    </svg>
  )
}
