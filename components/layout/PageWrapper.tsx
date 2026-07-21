'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { pageTransition } from '@/lib/animations'

// ─────────────────────────────────────────────────────────────
// PageWrapper — Consistent page container
// Max width + padding for all dashboard pages
// ─────────────────────────────────────────────────────────────

interface PageWrapperProps {
  children: React.ReactNode
  className?: string
}

export function PageWrapper({ children, className }: PageWrapperProps) {
  return (
    <motion.div 
      variants={pageTransition}
      initial="hidden"
      animate="show"
      className={cn('max-w-4xl mx-auto px-4 md:px-6 py-6', className)}
    >
      {children}
    </motion.div>
  )
}
