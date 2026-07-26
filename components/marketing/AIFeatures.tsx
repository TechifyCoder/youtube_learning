'use client'

import { motion } from 'framer-motion'
import { Sparkles, MessageSquare, Brain } from 'lucide-react'

export function AIFeatures() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col lg:flex-row items-center gap-16 max-w-6xl mx-auto">
          
          <div className="flex-1 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[--accent]/10 text-[--accent-light] font-medium text-sm">
              <Sparkles className="w-4 h-4" /> Powered by Gemini AI
            </div>
            
            <h2 className="text-3xl md:text-5xl font-heading font-bold leading-tight">
              Your personal AI tutor for every video.
            </h2>
            
            <p className="text-lg text-[--text-secondary]">
              LearnLoop doesn't just track your progress. It actively helps you understand the material. Our AI reads the full video transcript and is ready to answer questions, explain concepts, or generate practice quizzes.
            </p>

            <ul className="space-y-4">
              <li className="flex gap-4">
                <div className="mt-1 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-bold">Context-Aware Chat</h4>
                  <p className="text-[--text-secondary] text-sm">Ask "What did he mean at 5:23?" and get an instant, accurate answer based on the transcript.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="mt-1 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                  <Brain className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-bold">Auto-Generated Quizzes</h4>
                  <p className="text-[--text-secondary] text-sm">Finish a video and immediately test your knowledge with AI-generated multiple choice questions.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="flex-1 w-full relative">
            {/* Optimized Background Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(124,92,252,0.15)_0%,transparent_70%)] pointer-events-none transform-gpu" />
            
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative rounded-2xl border border-white/10 bg-[#1A1628] shadow-2xl overflow-hidden"
            >
              {/* Chat Header */}
              <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-white/5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[--accent] to-blue-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-bold text-sm">AI Tutor</div>
                  <div className="text-xs text-green-400">Online</div>
                </div>
              </div>

              {/* Chat Body */}
              <div className="p-4 space-y-4 h-[300px] flex flex-col justify-end text-sm">
                
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="self-end max-w-[80%] bg-white/10 p-3 rounded-2xl rounded-tr-sm"
                >
                  Can you explain how the Event Loop works from this video?
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1 }}
                  className="self-start max-w-[85%] bg-[--accent]/20 border border-[--accent]/30 p-3 rounded-2xl rounded-tl-sm text-[--accent-lighter]"
                >
                  <p className="mb-2">Sure! Based on the transcript at 12:45, the speaker explains it like this:</p>
                  <ul className="list-disc pl-4 space-y-1 text-xs opacity-90">
                    <li>Call Stack: Executes code synchronously</li>
                    <li>Web APIs: Handles async operations (setTimeout)</li>
                    <li>Task Queue: Holds callbacks ready to run</li>
                  </ul>
                </motion.div>

              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-white/10 bg-white/5">
                <div className="w-full h-10 rounded-full bg-black/40 border border-white/10 flex items-center px-4">
                  <div className="w-2 h-4 bg-[--accent] rounded-sm animate-pulse" />
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  )
}
