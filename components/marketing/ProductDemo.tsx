'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { PlayCircle, CheckCircle2, Youtube } from 'lucide-react'

export function ProductDemo() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  })

  // Rotate up and scale in as it scrolls into view
  const rotateX = useTransform(scrollYProgress, [0, 0.4], [25, 0])
  const scale = useTransform(scrollYProgress, [0, 0.4], [0.8, 1])
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1])
  
  // Parallax for inner elements
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -50])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 50])

  return (
    <section ref={containerRef} className="relative py-24 sm:py-32 overflow-hidden perspective-[2000px]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <motion.div 
          style={{ rotateX, scale, opacity }}
          className="relative max-w-5xl mx-auto rounded-xl border border-white/10 bg-white/5 p-2 sm:p-4 backdrop-blur-xl shadow-2xl shadow-[--accent-glow] transform-gpu"
        >
          {/* Mac-like Window Header */}
          <div className="flex items-center gap-2 px-3 pb-3 pt-1 border-b border-white/5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <div className="mx-auto text-xs text-muted-foreground font-mono bg-black/20 px-4 py-1 rounded-md">
              learnloop.app/dashboard
            </div>
          </div>

          {/* Fake Dashboard Content */}
          <div className="relative aspect-video bg-[#0a0a0a] rounded-b-lg overflow-hidden flex flex-col md:flex-row">
            
            {/* Sidebar Mock */}
            <div className="hidden md:flex w-64 bg-white/[0.02] border-r border-white/5 flex-col p-4 gap-4">
              <div className="h-8 w-32 bg-white/10 rounded-md animate-pulse" />
              <div className="space-y-3 mt-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded bg-white/10" />
                    <div className="h-4 flex-1 bg-white/5 rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Main Content Mock */}
            <div className="flex-1 p-6 sm:p-8 flex flex-col gap-6 relative">
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-xl font-bold mb-2">React Mastery Course</div>
                  <div className="flex gap-2">
                    <span className="text-xs bg-[--accent]/20 text-[--accent-light] px-2 py-1 rounded">12/48 Videos</span>
                    <span className="text-xs bg-white/10 text-white/60 px-2 py-1 rounded">25% Complete</span>
                  </div>
                </div>
                <div className="hidden sm:block text-right">
                  <div className="text-3xl font-heading font-bold text-green-400">🔥 7 Day Streak</div>
                </div>
              </div>

              {/* Video Player Area Mock */}
              <motion.div style={{ y: y1 }} className="relative flex-1 rounded-xl border border-white/10 bg-black overflow-hidden group">
                <div className="absolute inset-0 flex items-center justify-center bg-white/5 group-hover:bg-white/10 transition-colors cursor-pointer">
                  <Youtube className="w-16 h-16 text-red-500 opacity-80" />
                </div>
                {/* Progress bar mock */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                  <div className="h-full w-1/3 bg-red-500" />
                </div>
              </motion.div>

              {/* Floating Chat / AI Mock */}
              <motion.div 
                style={{ y: y2 }}
                className="absolute right-[-20px] top-1/3 w-64 rounded-xl border border-white/10 bg-[#1A1628]/90 backdrop-blur-md p-4 shadow-xl hidden lg:block"
              >
                <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <span className="text-xs">🤖</span>
                  </div>
                  <div className="text-sm font-medium">AI Tutor</div>
                </div>
                <div className="text-xs text-white/80 leading-relaxed space-y-2">
                  <p>I noticed you paused the video on React Hooks.</p>
                  <p className="bg-[--accent]/20 p-2 rounded text-[--accent-lighter]">
                    Would you like me to explain `useEffect` in simpler terms?
                  </p>
                </div>
              </motion.div>

              {/* Next Up Mock */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="rounded-lg border border-white/5 bg-white/[0.02] p-3 flex gap-3 items-start">
                    <div className="w-12 h-8 bg-white/10 rounded flex-shrink-0 relative overflow-hidden">
                      {i === 1 && <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-green-500" /></div>}
                      {i === 2 && <div className="absolute inset-0 flex items-center justify-center"><PlayCircle className="w-4 h-4 text-white/50" /></div>}
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="h-2 w-full bg-white/10 rounded" />
                      <div className="h-2 w-2/3 bg-white/10 rounded" />
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
