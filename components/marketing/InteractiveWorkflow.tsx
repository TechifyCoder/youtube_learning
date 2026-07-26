'use client'

import { motion } from 'framer-motion'
import { Youtube, Activity, BrainCircuit, HelpCircle, Repeat, LineChart } from 'lucide-react'

const workflowSteps = [
  { icon: <Youtube className="w-6 h-6 text-red-500" />, label: 'YouTube Playlist' },
  { icon: <Activity className="w-6 h-6 text-green-500" />, label: 'Progress Tracking' },
  { icon: <BrainCircuit className="w-6 h-6 text-[--accent-light]" />, label: 'AI Analysis' },
  { icon: <HelpCircle className="w-6 h-6 text-yellow-500" />, label: 'Dynamic Quizzes' },
  { icon: <Repeat className="w-6 h-6 text-blue-500" />, label: 'Spaced Revision' },
  { icon: <LineChart className="w-6 h-6 text-purple-500" />, label: 'Analytics' },
]

export function InteractiveWorkflow() {
  return (
    <section className="py-24 bg-black/20 border-y border-white/5 relative overflow-hidden">
      {/* Optimized background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[400px] bg-[radial-gradient(circle,var(--accent-glow)_0%,transparent_60%)] pointer-events-none transform-gpu" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-heading font-bold mb-4">
            The LearnLoop Engine
          </h2>
          <p className="text-[--text-secondary]">How we turn content into knowledge.</p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-2 flex-wrap max-w-5xl mx-auto">
          {workflowSteps.map((step, i) => (
            <div key={step.label} className="flex flex-col md:flex-row items-center gap-4 md:gap-2">
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.15 }}
                className="flex flex-col items-center justify-center p-4 w-32 h-32 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl hover:bg-white/10 transition-colors cursor-default group"
              >
                <div className="mb-3 p-3 rounded-full bg-black/40 group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>
                <span className="text-xs font-semibold text-center leading-tight">{step.label}</span>
              </motion.div>

              {/* Arrow */}
              {i < workflowSteps.length - 1 && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  whileInView={{ opacity: 1, width: 'auto' }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: (i * 0.15) + 0.2 }}
                  className="hidden md:flex items-center justify-center px-2"
                >
                  <div className="h-[2px] w-8 bg-gradient-to-r from-transparent via-[--accent-light] to-transparent relative overflow-hidden">
                    <motion.div 
                      className="absolute inset-0 w-full h-full bg-white/50"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  </div>
                </motion.div>
              )}
              
              {/* Mobile Arrow */}
              {i < workflowSteps.length - 1 && (
                <div className="md:hidden h-8 w-[2px] bg-gradient-to-b from-transparent via-[--accent-light] to-transparent" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
