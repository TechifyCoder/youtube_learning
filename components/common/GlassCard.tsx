import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────
// GlassCard — Reusable frosted glass card wrapper
// Exact variants from DESIGN.md Section 4
// ─────────────────────────────────────────────────────────────

export type GlassCardVariant = 'standard' | 'elevated' | 'subtle' | 'active'

interface GlassCardProps {
  children: React.ReactNode
  variant?: GlassCardVariant
  className?: string
  onClick?: () => void
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const variants: Record<GlassCardVariant, string> = {
  standard: 'bg-white/[0.05] backdrop-blur-md border border-white/[0.08]',
  elevated: 'bg-white/[0.09] backdrop-blur-xl border border-white/[0.15]',
  subtle:   'bg-white/[0.03] backdrop-blur-sm border border-white/[0.06]',
  active:   'bg-purple-500/[0.12] backdrop-blur-md border border-purple-400/[0.25]',
}

const paddings = {
  none: '',
  sm:   'p-3',
  md:   'p-5',
  lg:   'p-7',
}

export function GlassCard({
  children,
  variant = 'standard',
  className,
  onClick,
  padding = 'md',
}: GlassCardProps) {
  return (
    <div
      className={cn(
        variants[variant],
        paddings[padding],
        'rounded-2xl',
        onClick && 'cursor-pointer hover:bg-white/[0.08] hover:border-white/[0.14] hover:-translate-y-0.5 transition-all duration-200',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
