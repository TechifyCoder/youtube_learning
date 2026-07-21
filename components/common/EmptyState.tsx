'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────
// EmptyState — Illustrated empty state with optional CTA
// ─────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'flex flex-col items-center justify-center text-center py-16 px-6',
        className
      )}
    >
      {/* Icon container */}
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center mb-5 text-[--text-muted]">
          {icon}
        </div>
      )}

      {/* Empty state illustration (dots grid) */}
      {!icon && (
        <div className="w-16 h-16 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center mb-5">
          <div className="grid grid-cols-3 gap-1">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-1.5 h-1.5 rounded-full',
                  i === 4 ? 'bg-purple-400/60' : 'bg-white/[0.12]'
                )}
              />
            ))}
          </div>
        </div>
      )}

      {/* Text */}
      <h3 className="font-heading font-semibold text-heading text-[--text-primary] mb-2">
        {title}
      </h3>
      <p className="text-body text-[--text-secondary] max-w-xs mb-6">
        {description}
      </p>

      {/* CTA button */}
      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-medium text-sm px-5 py-2.5 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/25 active:scale-[0.98]"
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-medium text-sm px-5 py-2.5 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/25 active:scale-[0.98]"
          >
            {action.label}
          </button>
        )
      )}
    </motion.div>
  )
}
