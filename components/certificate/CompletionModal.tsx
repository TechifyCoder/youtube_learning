'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import Link from 'next/link'
import { Trophy, X } from 'lucide-react'

interface CompletionModalProps {
  courseTitle: string
  certificateId: string
  totalHours: number
  daysTaken: number
}

export function CompletionModal({ courseTitle, certificateId, totalHours, daysTaken }: CompletionModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // We only open it if the user just completed the course
    // The parent component should control this, but for simplicity, 
    // let's assume it mounts when completion is detected.
    setIsOpen(true)
    
    // Fire confetti
    const duration = 3 * 1000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#8B5CF6', '#3B82F6', '#10B981']
      })
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#8B5CF6', '#3B82F6', '#10B981']
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }
    
    frame()
  }, [])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-[--bg-secondary] border border-purple-500/30 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl overflow-hidden"
          >
            {/* Ambient glow inside card */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[200px] bg-purple-500/20 rounded-full blur-[60px] pointer-events-none" />

            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-[--text-secondary] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-yellow-500/20">
              <Trophy className="w-8 h-8 text-white" />
            </div>

            <h2 className="text-3xl font-heading font-bold text-white mb-2">Course Complete! 🎉</h2>
            <p className="text-[--text-secondary] mb-6">
              You&apos;ve successfully finished <strong className="text-white">{courseTitle}</strong>.
            </p>

            <div className="flex justify-center gap-6 mb-8">
              <div>
                <div className="text-2xl font-bold text-white">{totalHours}h</div>
                <div className="text-xs text-[--text-secondary]">Time Invested</div>
              </div>
              <div className="w-px bg-white/10" />
              <div>
                <div className="text-2xl font-bold text-white">{daysTaken}</div>
                <div className="text-xs text-[--text-secondary]">Days Taken</div>
              </div>
            </div>

            <Link 
              href={`/certificate/${certificateId}`}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              View Certificate
            </Link>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
