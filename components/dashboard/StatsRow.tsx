import { GlassCard } from '@/components/common/GlassCard'
import { Clock, BookOpen, CheckCircle2 } from 'lucide-react'
import type { StatsData } from '@/types'

// ─────────────────────────────────────────────────────────────
// StatsRow Component
// Shows total hours watched, active courses, completed courses
// ─────────────────────────────────────────────────────────────

interface StatsRowProps {
  stats: StatsData
}

export function StatsRow({ stats }: StatsRowProps) {
  const items = [
    {
      label: 'Hours Watched',
      value: stats.totalHoursWatched,
      icon: Clock,
      color: 'text-blue-400',
      bg: 'bg-blue-500/[0.12]',
    },
    {
      label: 'Active Courses',
      value: stats.activeCoursesCount,
      icon: BookOpen,
      color: 'text-purple-400',
      bg: 'bg-purple-500/[0.12]',
    },
    {
      label: 'Completed Courses',
      value: stats.completedCoursesCount,
      icon: CheckCircle2,
      color: 'text-green-400',
      bg: 'bg-green-500/[0.12]',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <GlassCard key={item.label} padding="sm" variant="subtle" className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.bg}`}>
              <Icon className={`w-6 h-6 ${item.color}`} />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-[--text-primary] leading-none mb-1">
                {item.value}
              </p>
              <p className="text-sm font-medium text-[--text-secondary]">
                {item.label}
              </p>
            </div>
          </GlassCard>
        )
      })}
    </div>
  )
}
