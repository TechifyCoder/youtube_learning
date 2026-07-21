'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, RotateCcw } from 'lucide-react'

export function TimeTrackerCard() {
  const [isRunning, setIsRunning] = useState(false)
  const [time, setTime] = useState(0) // seconds

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning])

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60
    if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="relative overflow-hidden bg-[--bg-card] rounded-3xl border border-[--border-subtle] p-6 flex flex-col justify-between h-full min-h-[300px] shadow-card group"
    >
      {/* Animated Glowing Background (Replaced Spline to fix crash) */}
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(ellipse_at_center,_var(--accent)_0%,_transparent_50%)]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -right-1/2 w-[200%] h-[200%] bg-[radial-gradient(ellipse_at_center,_var(--green)_0%,_transparent_40%)]"
        />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <h3 className="text-label text-[--text-muted] uppercase tracking-wider mb-2">Focus Tracker</h3>
        
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-5xl font-mono font-bold text-[--text-primary] tracking-tight tabular-nums drop-shadow-md">
            {formatTime(time)}
          </div>
          <p className="text-caption text-[--text-secondary] mt-2 bg-[--bg-card]/50 backdrop-blur-md px-3 py-1 rounded-full">
            Current Session
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => setTime(0)}
            className="w-10 h-10 rounded-full bg-black/[0.05] dark:bg-white/[0.05] flex items-center justify-center text-[--text-secondary] hover:text-[--text-primary] transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="w-14 h-14 rounded-full bg-[--accent] text-white flex items-center justify-center shadow-accent hover:scale-105 active:scale-95 transition-all duration-200"
          >
            {isRunning ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
