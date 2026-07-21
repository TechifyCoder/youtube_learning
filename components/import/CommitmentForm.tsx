'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeInUp } from '@/lib/animations'
import { GlassCard } from '@/components/common/GlassCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Calendar, Target, Clock, ArrowRight } from 'lucide-react'
import { formatDuration } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────
// CommitmentForm Component
// Calculates required daily minutes based on playlist duration and days
// ─────────────────────────────────────────────────────────────

interface CommitmentFormProps {
  totalDurationSeconds: number
  onConfirm: (days: number, hoursPerDay: number, startDate: Date) => void
  isLoading?: boolean
}

export function CommitmentForm({
  totalDurationSeconds,
  onConfirm,
  isLoading = false,
}: CommitmentFormProps) {
  const [days, setDays] = useState<number>(30)
  const [secondsPerDay, setSecondsPerDay] = useState<number>(0)

  // Calculate required seconds per day when total duration or target days change
  useEffect(() => {
    if (days > 0) {
      setSecondsPerDay(totalDurationSeconds / days)
    } else {
      setSecondsPerDay(0)
    }
  }, [days, totalDurationSeconds])

  const handleDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10)
    if (!isNaN(val) && val >= 1) {
      setDays(val)
    } else if (e.target.value === '') {
      setDays(0) // Allow empty input temporarily
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (days > 0) {
      const hoursPerDay = secondsPerDay / 3600
      onConfirm(days, hoursPerDay, new Date())
    }
  }

  return (
    <motion.div variants={fadeInUp} initial="initial" animate="animate">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <GlassCard variant="subtle" className="space-y-5">
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/[0.15] flex items-center justify-center shrink-0">
              <Target className="w-4 h-4 text-purple-400" />
            </div>
            <h3 className="font-heading font-medium text-[--text-primary]">
              Set your learning goal
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Days input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[--text-secondary] flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Finish in (days)
              </label>
              <Input
                type="number"
                min="1"
                max="365"
                value={days || ''}
                onChange={handleDaysChange}
                className="bg-white/[0.03] text-lg font-medium"
                required
              />
            </div>

            {/* Calculated daily commitment */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[--text-secondary] flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Required daily pace
              </label>
              <div className="h-[50px] bg-white/[0.02] border border-white/[0.06] rounded-xl flex items-center px-4">
                <span className="text-lg font-heading font-medium text-purple-300">
                  {secondsPerDay > 0 ? formatDuration(secondsPerDay) : '—'}
                  <span className="text-sm text-[--text-muted] font-body ml-2">/ day</span>
                </span>
              </div>
            </div>
          </div>
        </GlassCard>

        <Button
          type="submit"
          size="lg"
          disabled={days <= 0 || isLoading}
          className="w-full text-base font-semibold group"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving course...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              Add to My Courses
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          )}
        </Button>
      </form>
    </motion.div>
  )
}
