import { cn } from '@/lib/utils'
import type { ScheduleStatus } from '@/types'

// ─────────────────────────────────────────────────────────────
// Badge — Status pills for schedule and source labels
// Exact classes from DESIGN.md Section 5
// ─────────────────────────────────────────────────────────────

type BadgeVariant = ScheduleStatus | 'youtube' | 'custom'

interface BadgeProps {
  variant: BadgeVariant
  className?: string
}

const baseClasses =
  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium'

const variantClasses: Record<BadgeVariant, string> = {
  on_track:  'bg-green-500/[0.12] text-green-400 border border-green-500/[0.25]',
  behind:    'bg-red-500/[0.12] text-red-400 border border-red-500/[0.25]',
  upcoming:  'bg-purple-500/[0.12] text-purple-300 border border-purple-500/[0.25]',
  completed: 'bg-green-500/[0.08] text-green-500/80 border border-green-500/[0.15]',
  youtube:   'bg-red-500/[0.10] text-red-400 border border-red-500/[0.20]',
  custom:    'bg-blue-500/[0.10] text-blue-400 border border-blue-500/[0.20]',
}

const variantLabels: Record<BadgeVariant, string> = {
  on_track:  'On Track',
  behind:    'Behind',
  upcoming:  'Upcoming',
  completed: 'Completed',
  youtube:   'YouTube',
  custom:    'Custom',
}

const variantDots: Record<BadgeVariant, string> = {
  on_track:  'bg-green-400',
  behind:    'bg-red-400',
  upcoming:  'bg-purple-400',
  completed: 'bg-green-500/80',
  youtube:   'bg-red-400',
  custom:    'bg-blue-400',
}

export function Badge({ variant, className }: BadgeProps) {
  return (
    <span className={cn(baseClasses, variantClasses[variant], className)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', variantDots[variant])} />
      {variantLabels[variant]}
    </span>
  )
}
