'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface QuizTriggerBannerProps {
  onStartQuiz: () => void
  onSkip: () => void
  isVisible: boolean
}

export function QuizTriggerBanner({ onStartQuiz, onSkip, isVisible }: QuizTriggerBannerProps) {
  const [timeLeft, setTimeLeft] = useState(15)

  useEffect(() => {
    if (!isVisible) return

    setTimeLeft(15)
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          onSkip()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isVisible, onSkip])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-lg"
        >
          <div className="bg-background/80 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl relative overflow-hidden flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-2 rounded-full">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Test yourself on this video?</h4>
                <p className="text-xs text-muted-foreground">Takes ~2 min</p>
              </div>
            </div>
            <div className="flex items-center gap-2 z-10">
              <Button variant="ghost" size="sm" onClick={onSkip}>Skip</Button>
              <Button size="sm" onClick={onStartQuiz} className="gap-1">
                Start Quiz <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Progress Bar for countdown */}
            <motion.div 
              className="absolute bottom-0 left-0 h-1 bg-primary"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 15, ease: "linear" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
