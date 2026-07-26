'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

function Counter({ from, to, duration, suffix = '' }: { from: number, to: number, duration: number, suffix?: string }) {
  const [count, setCount] = useState(from)
  const nodeRef = useRef<HTMLSpanElement>(null)
  const inView = useInView(nodeRef, { once: true, margin: "-100px" })

  useEffect(() => {
    if (!inView) return

    let startTimestamp: number | null = null
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1)
      
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      
      setCount(Math.floor(easeProgress * (to - from) + from))
      
      if (progress < 1) {
        window.requestAnimationFrame(step)
      }
    }
    
    window.requestAnimationFrame(step)
  }, [inView, from, to, duration])

  return (
    <span ref={nodeRef}>
      {count}{suffix}
    </span>
  )
}

const stats = [
  { value: 45, suffix: 'M+', label: 'Hours of YouTube Watched' },
  { value: 92, suffix: '%', label: 'Higher Completion Rate' },
  { value: 120, suffix: 'k', label: 'Quizzes Generated' },
  { value: 4, suffix: 'x', label: 'Faster Knowledge Retention' },
]

export function VisualStats() {
  return (
    <section className="py-20 border-y border-white/5 bg-white/[0.02]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col gap-2"
            >
              <div className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50">
                <Counter from={0} to={stat.value} duration={2} suffix={stat.suffix} />
              </div>
              <div className="text-sm md:text-base text-[--text-secondary] font-medium uppercase tracking-wider">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
