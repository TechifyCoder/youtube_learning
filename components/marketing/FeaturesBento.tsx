'use client'

import { motion } from 'framer-motion'
import { BrainCircuit, Target, Trophy, Clock, CheckCircle2, History } from 'lucide-react'
import { useRef } from 'react'

const features = [
  {
    title: 'Track Playlists',
    description: 'Import any YouTube playlist and turn it into a structured course with a red/green progress bar.',
    icon: <Target className="w-6 h-6 text-blue-400" />,
    className: 'md:col-span-2 md:row-span-2',
    visual: (
      <div className="mt-6 flex flex-col gap-3">
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
          <div className="h-full w-[45%] bg-blue-500 rounded-full" />
        </div>
        <div className="flex gap-2">
          <div className="w-16 h-10 rounded bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex-1 h-10 rounded bg-white/5" />
          <div className="flex-1 h-10 rounded bg-white/5" />
        </div>
      </div>
    )
  },
  {
    title: 'AI Transcript Q&A',
    description: 'Ask questions directly to the video. Our AI reads the transcript and answers instantly.',
    icon: <BrainCircuit className="w-6 h-6 text-[--accent-light]" />,
    className: 'md:col-span-1 md:row-span-2',
    visual: (
      <div className="mt-6 flex flex-col gap-2">
        <div className="self-end bg-white/10 rounded-t-lg rounded-bl-lg px-3 py-2 text-xs w-3/4">What does this code do?</div>
        <div className="self-start bg-[--accent]/20 border border-[--accent]/30 rounded-t-lg rounded-br-lg px-3 py-2 text-xs w-5/6 text-[--accent-lighter]">This React hook manages the component's internal state.</div>
      </div>
    )
  },
  {
    title: 'Learning Streaks',
    description: 'Build consistency. Don\'t break the chain.',
    icon: <Trophy className="w-6 h-6 text-yellow-400" />,
    className: 'md:col-span-1',
    visual: (
      <div className="mt-4 flex gap-1 justify-between items-end h-12">
        {[4, 6, 8, 5, 9, 12, 10].map((h, i) => (
          <div key={i} className="w-full bg-yellow-400/20 rounded-t-sm" style={{ height: `${h * 10}%` }}>
            <div className="w-full bg-yellow-400 rounded-t-sm h-1" />
          </div>
        ))}
      </div>
    )
  },
  {
    title: 'Smart Resume',
    description: 'Pick up exactly where you left off. Every time.',
    icon: <Clock className="w-6 h-6 text-red-400" />,
    className: 'md:col-span-1',
    visual: null
  },
  {
    title: 'Study History',
    description: 'Visualize your learning patterns over time.',
    icon: <History className="w-6 h-6 text-purple-400" />,
    className: 'md:col-span-1',
    visual: null
  }
]

export function FeaturesBento() {
  const containerRef = useRef(null)

  return (
    <section className="py-24 relative" id="features">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6">
            Everything you need to master any subject
          </h2>
          <p className="text-lg text-[--text-secondary]">
            LearnLoop provides the tools you need to stay focused, retain knowledge, and build a consistent learning habit.
          </p>
        </div>

        <div 
          ref={containerRef}
          className="grid grid-cols-1 md:grid-cols-3 auto-rows-[180px] gap-4 md:gap-6 max-w-6xl mx-auto"
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ scale: 0.98 }}
              className={`relative group rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 overflow-hidden hover:bg-white/[0.08] transition-colors ${feature.className}`}
            >
              {/* Radial gradient hover effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-white/5">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                </div>
                
                <p className="text-[--text-secondary] text-sm md:text-base leading-relaxed">
                  {feature.description}
                </p>

                {feature.visual && (
                  <div className="mt-auto">
                    {feature.visual}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
