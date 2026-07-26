'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: 'Is LearnLoop free to use?',
    a: 'Yes, the core features of LearnLoop are free. You need to provide your own YouTube API key and Gemini API key (which have generous free tiers) during onboarding to enable the platform.'
  },
  {
    q: 'Does it work with any YouTube video?',
    a: 'LearnLoop works best with YouTube playlists. Just paste the playlist URL, and we will import all the videos, their durations, and generate transcripts.'
  },
  {
    q: 'How does the AI Tutor work?',
    a: 'We fetch the captions/transcript of the YouTube video you are watching and pass it to the Gemini AI as context. This allows the AI to answer specific questions about the video content accurately.'
  },
  {
    q: 'Where is my data stored?',
    a: 'Your personal data (like API keys) is encrypted and securely stored in our Platform Database. Your learning progress and playlists are stored in an isolated User Database specifically created for your account.'
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="py-24 relative" id="faq">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i
            
            return (
              <div 
                key={i} 
                className={`rounded-2xl border transition-colors duration-300 overflow-hidden ${isOpen ? 'border-[--accent]/50 bg-white/10' : 'border-white/10 bg-white/5 hover:bg-white/[0.07]'}`}
              >
                <button 
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[--accent] rounded-2xl"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                >
                  <span className="font-bold text-lg">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[--accent-light]' : 'text-white/50'}`} />
                </button>
                
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      <div className="px-6 pb-6 text-[--text-secondary] leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
