import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────
// LoadingSpinner — Centered spinner with optional text
// ─────────────────────────────────────────────────────────────

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
  centered?: boolean
}

const sizes = {
  sm: 'w-4 h-4 border-[1.5px]',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-2',
}

export function LoadingSpinner({
  size = 'md',
  className,
  text,
  centered = false,
}: LoadingSpinnerProps) {
  const spinner = (
    <div className={cn('flex items-center gap-3', centered && 'justify-center', className)}>
      <div
        className={cn(
          'rounded-full border-white/[0.15] border-t-purple-400 animate-spin',
          sizes[size]
        )}
      />
      {text && (
        <span className="text-body-sm text-[--text-muted]">{text}</span>
      )}
    </div>
  )

  if (centered) {
    return (
      <div className="flex items-center justify-center w-full py-12">
        {spinner}
      </div>
    )
  }

  return spinner
}
