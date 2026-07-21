import { Variants } from 'framer-motion'

// ─────────────────────────────────────────────────────────────
// lib/animations.ts — Framer Motion Presets
// ─────────────────────────────────────────────────────────────

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

export const fadeInUp: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24
    }
  }
}

export const slideInRight: Variants = {
  hidden: { 
    opacity: 0, 
    x: 20 
  },
  show: { 
    opacity: 1, 
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24
    }
  }
}

export const slideDown: Variants = {
  hidden: { 
    opacity: 0, 
    y: -20,
    scale: 0.95
  },
  show: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30
    }
  }
}

export const pageTransition: Variants = {
  hidden: { 
    opacity: 0, 
    y: 10 
  },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  }
}

export const badgePulse: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  show: { 
    scale: 1, 
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 20
    }
  },
  update: {
    scale: [1, 1.2, 1],
    transition: {
      duration: 0.3
    }
  }
}
