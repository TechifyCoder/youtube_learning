'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function CallToAction({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <section className="py-32 relative overflow-hidden">
      
      {/* Optimized Background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse,var(--accent-glow)_0%,transparent_70%)] pointer-events-none transform-gpu" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto border border-[--border-accent] bg-white/5 backdrop-blur-xl p-12 md:p-20 rounded-[3rem] shadow-2xl shadow-[--accent-glow]"
        >
          <h2 className="text-4xl md:text-6xl font-heading font-black mb-6 tracking-tight">
            Ready to build a real learning habit?
          </h2>
          <p className="text-xl text-[--text-secondary] mb-10 max-w-2xl mx-auto text-balance">
            Stop procrastinating and start finishing those tutorials. Join LearnLoop today and transform the way you watch YouTube.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={isLoggedIn ? "/dashboard" : "/login"}>
              <button className="group px-8 py-5 bg-white text-black hover:bg-gray-100 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] hover:scale-105">
                {isLoggedIn ? 'Go to Dashboard' : 'Get Started for Free'} 
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
          
          <p className="mt-6 text-sm text-[--text-muted]">
            No credit card required. Free tier includes Gemini AI integration.
          </p>
        </motion.div>

      </div>
    </section>
  )
}
