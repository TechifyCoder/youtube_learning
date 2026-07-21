'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface StreakData {
  currentStreak: number
  longestStreak: number
  isAlive: boolean
}

export function StreakRecoveryModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [data, setData] = useState<StreakData | null>(null)

  useEffect(() => {
    async function checkStreak() {
      // Check if we've already shown the modal today
      const todayStr = new Date().toISOString().split('T')[0]
      const lastShown = localStorage.getItem('streak_recovery_shown_date')
      
      if (lastShown === todayStr) return

      try {
        const res = await fetch('/api/streak')
        if (res.ok) {
          const json: StreakData = await res.json()
          
          // If streak is not alive and currentStreak is 0 but they had a previous longest streak
          // meaning they just broke it. (Note: Our API currently returns currentStreak: 0 if not alive)
          // Actually, if it's not alive, the API returned currentStreak = 0. We might need to know 
          // what their previous streak was, but since we overwrite it, we can just say "Your streak has reset".
          if (!json.isAlive && json.longestStreak > 0) {
            setData(json)
            setIsOpen(true)
            localStorage.setItem('streak_recovery_shown_date', todayStr!)
          }
        }
      } catch (err) {
        console.error('Failed to check streak for recovery modal:', err)
      }
    }
    
    checkStreak()
  }, [])

  if (!isOpen || !data) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md p-6 overflow-hidden bg-[#0A0812] border border-white/10 rounded-2xl shadow-2xl"
        >
          {/* Background glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/20 rounded-full blur-[60px] pointer-events-none" />

          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center mt-4">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6">
              <Flame className="w-8 h-8 text-red-500 opacity-80" />
            </div>
            
            <h2 className="text-2xl font-heading font-bold text-white mb-2">
              You missed a day!
            </h2>
            <p className="text-zinc-400 mb-8 max-w-[280px]">
              Your learning streak has reset. Don't let that stop you—every expert was once a beginner who didn't quit.
            </p>

            <Button 
              onClick={() => setIsOpen(false)}
              className="w-full bg-white text-black hover:bg-zinc-200 py-6 font-semibold"
            >
              Start fresh — Day 1
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
