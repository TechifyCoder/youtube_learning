'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/common/GlassCard'
import { Flame, Trophy } from 'lucide-react'
import { fadeInUp } from '@/lib/animations'
import { toast } from 'react-hot-toast'

interface StreakData {
  currentStreak: number
  longestStreak: number
  isAlive: boolean
}

export function StreakCard() {
  const [data, setData] = useState<StreakData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStreak() {
      try {
        const res = await fetch('/api/streak')
        if (res.ok) {
          const json = await res.json()
          setData(json)
          
          // Show milestone toasts based on current streak
          if (json.currentStreak === 3) toast.success("3 day streak! 🔥 Keep going!", { id: 'streak-3' })
          if (json.currentStreak === 7) toast.success("One week streak! 🎉", { id: 'streak-7' })
          if (json.currentStreak === 30) toast.success("30 days! You're unstoppable! 🏆", { id: 'streak-30' })
        }
      } catch (err) {
        console.error('Failed to fetch streak:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchStreak()
  }, [])

  if (loading || !data) {
    return (
      <GlassCard padding="sm" className="h-full flex items-center justify-center min-h-[120px]">
        <div className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </GlassCard>
    )
  }

  const { currentStreak, longestStreak, isAlive } = data

  return (
    <GlassCard padding="md" variant="subtle" className="relative overflow-hidden h-full flex flex-col justify-center">
      {/* Decorative gradient orb */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-orange-500/20 rounded-full blur-[40px] pointer-events-none" />

      <div className="flex items-start justify-between relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Flame className={`w-5 h-5 ${isAlive && currentStreak > 0 ? 'text-orange-500' : 'text-zinc-500'}`} />
            <h3 className="font-medium text-[--text-secondary] text-sm uppercase tracking-wider">
              Current Streak
            </h3>
          </div>
          
          <div className="flex items-baseline gap-2 mt-2">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={currentStreak}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-4xl sm:text-5xl font-heading font-bold text-[--text-primary]"
              >
                {currentStreak}
              </motion.span>
            </AnimatePresence>
            <span className="text-[--text-secondary] font-medium">days</span>
          </div>

          <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-sm">
            <Trophy className="w-4 h-4 text-yellow-500 shrink-0" />
            <span className="text-[--text-secondary] whitespace-nowrap">
              Personal best: <span className="text-[--text-primary] font-semibold">{longestStreak} days</span>
            </span>
          </div>
        </div>
      </div>

      {!isAlive && currentStreak === 0 && longestStreak > 0 && (
        <motion.div {...fadeInUp} className="mt-3 text-sm text-red-400/80 font-medium">
          Streak reset — start fresh 💪
        </motion.div>
      )}
      {!isAlive && currentStreak === 0 && longestStreak === 0 && (
        <motion.div {...fadeInUp} className="mt-3 text-sm text-[--text-secondary] font-medium">
          Start your learning streak today!
        </motion.div>
      )}
    </GlassCard>
  )
}
