'use client'

import { motion } from 'framer-motion'
import { XCircle, CheckCircle2 } from 'lucide-react'

const traditional = [
  'Endless recommended videos trap',
  'Lose track of what you watched',
  'Passively watching without taking notes',
  'Forgetting concepts after 2 days',
  'No structure or syllabus',
]

const learnloop = [
  'Distraction-free learning environment',
  'Visual red/green progress tracking',
  'Active learning with AI-generated quizzes',
  'Spaced repetition for long-term memory',
  'Structured course-like experience',
]

export function ComparisonSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6">
            Why you keep failing to learn on YouTube
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* Traditional Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <XCircle className="w-32 h-32 text-red-500" />
            </div>
            
            <h3 className="text-2xl font-bold text-red-400 mb-8 relative z-10">Traditional YouTube</h3>
            
            <ul className="space-y-4 relative z-10">
              {traditional.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                  <span className="text-red-200/80">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* LearnLoop Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="rounded-3xl border border-[--accent]/30 bg-[--accent]/10 p-8 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[--accent]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-32 h-32 text-[--accent]" />
            </div>
            
            <h3 className="text-2xl font-bold text-[--accent-light] mb-8 relative z-10">With LearnLoop</h3>
            
            <ul className="space-y-4 relative z-10">
              {learnloop.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[--accent-light] shrink-0 mt-0.5" />
                  <span className="text-white/90 font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
