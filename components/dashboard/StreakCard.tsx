'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/common/GlassCard'
import { Flame, Trophy, Check } from 'lucide-react'
import { fadeInUp } from '@/lib/animations'
import { toast } from 'react-hot-toast'

interface StreakData {
  currentStreak: number
  longestStreak: number
  isAlive: boolean
  activeDates?: string[]
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

  const { currentStreak, longestStreak, isAlive, activeDates = [] } = data

  const today = new Date()
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (6 - i))
    return {
      date: d,
      dateStr: d.toISOString().split('T')[0]!,
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
    }
  })

  return (
    <GlassCard padding="md" variant="subtle" className="relative overflow-hidden h-full flex flex-col justify-center">
      {/* Decorative gradient orb */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-orange-500/20 rounded-full blur-[40px] pointer-events-none" />

      <div className="flex items-start justify-between relative z-10 mb-4">
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

          <div className="mt-2 text-sm text-[--text-secondary]">
            {!isAlive && currentStreak === 0 && longestStreak > 0 
              ? "Streak reset — start fresh 💪" 
              : "Keep the momentum going!"}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 relative z-10">
        <div className="flex items-center justify-between relative">
          {/* Background line connecting all */}
          <div className="absolute top-4 left-[7%] right-[7%] h-[2px] bg-white/10 -z-10" />
          
          {weekDays.map((day) => {
            const isActive = activeDates.includes(day.dateStr)

            return (
              <div key={day.dateStr} className="flex flex-col items-center gap-2 z-10 relative">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300
                  ${isActive 
                    ? 'bg-primary border-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.6)]' 
                    : 'bg-[#111] border-white/10 text-white/20'}`}
                >
                  {isActive && <Check className="w-4 h-4" />}
                </div>
                <span className={`text-[10px] font-semibold uppercase tracking-wider ${isActive ? 'text-[--text-primary]' : 'text-[--text-muted]'}`}>
                  {day.dayName}
                </span>
              </div>
            )
          })}
        </div>
        
        <div className="mt-6 flex items-center gap-2 text-sm">
          <Trophy className="w-4 h-4 text-yellow-500 shrink-0" />
          <span className="text-[--text-secondary] whitespace-nowrap">
            Personal best: <span className="text-[--text-primary] font-semibold">{longestStreak} days</span>
          </span>
        </div>
      </div>
    </GlassCard>
  )
}
