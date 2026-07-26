'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'
import { Key, Link as LinkIcon, Play, MessageSquare, Flame, Sparkles } from 'lucide-react'

// --- UI Mockups for each step (Enlarged) ---

const SignInMockup = () => (
  <div className="w-full max-w-lg mx-auto bg-[#120F1D] border border-white/10 rounded-2xl p-8 shadow-2xl">
    <div className="text-center mb-8">
      <div className="w-14 h-14 bg-[#7C5CFC] rounded-2xl mx-auto mb-4 flex items-center justify-center font-bold text-white text-xl">LL</div>
      <div className="font-bold text-white text-xl">Welcome to LearnLoop</div>
      <div className="text-sm text-gray-500 mt-1">Sign in to continue</div>
    </div>
    <button className="w-full bg-white text-black font-semibold text-base py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors">
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
      Continue with Google
    </button>
  </div>
)

const APIKeysMockup = () => (
  <div className="w-full max-w-lg mx-auto bg-[#120F1D] border border-white/10 rounded-2xl p-8 shadow-2xl">
    <div className="flex items-center gap-3 mb-8 text-white font-bold text-lg">
      <Key className="w-5 h-5 text-[#7C5CFC]" /> API Settings
    </div>
    <div className="space-y-6">
      <div>
        <div className="text-sm text-gray-400 mb-2">YouTube API Key</div>
        <input disabled type="password" value="••••••••••••••••••••••••" className="w-full bg-[#1A1628] border border-white/5 rounded-xl px-4 py-3 text-base text-gray-300" />
      </div>
      <div>
        <div className="text-sm text-gray-400 mb-2">Gemini API Key</div>
        <input disabled type="password" value="••••••••••••••••••••••••" className="w-full bg-[#1A1628] border border-white/5 rounded-xl px-4 py-3 text-base text-gray-300" />
      </div>
      <button className="w-full bg-[#7C5CFC] text-white font-bold text-sm py-4 rounded-xl mt-4">Save Keys</button>
    </div>
  </div>
)

const ImportPlaylistMockup = () => (
  <div className="w-full max-w-lg mx-auto bg-[#120F1D] border border-white/10 rounded-2xl p-8 shadow-2xl">
    <div className="flex items-center gap-3 mb-8 text-white font-bold text-lg">
      <LinkIcon className="w-5 h-5 text-[#7C5CFC]" /> Import Course
    </div>
    <div className="bg-[#1A1628] border border-white/5 rounded-xl p-4 flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0">
        <Play className="w-5 h-5 text-red-500" />
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="text-sm text-white truncate font-mono">https://youtube.com/playlist?list=PL...</div>
      </div>
    </div>
    <button className="w-full bg-[#7C5CFC] text-white font-bold text-sm py-4 rounded-xl flex items-center justify-center gap-2">
      <LinkIcon className="w-4 h-4" /> Import Course
    </button>
  </div>
)

const VideoPlayerMockup = () => (
  <div className="w-full max-w-xl mx-auto bg-[#120F1D] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
    {/* Video Area */}
    <div className="w-full aspect-video bg-black relative flex items-center justify-center group">
      <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center pl-1 shadow-lg group-hover:scale-110 transition-transform cursor-pointer">
        <Play className="w-6 h-6 text-white" />
      </div>
      <div className="absolute bottom-0 left-0 w-full h-1.5 bg-white/20">
        <div className="h-full bg-red-600 w-1/3" />
      </div>
    </div>
    <div className="p-6">
      <div className="text-lg font-bold text-white mb-2">1. Introduction to React Hooks</div>
      <div className="text-sm text-gray-500">React Mastery Course • 12/48 Videos</div>
    </div>
  </div>
)

const AITutorMockup = () => (
  <div className="w-full max-w-lg mx-auto bg-[#120F1D] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[280px]">
    <div className="p-4 border-b border-white/10 bg-[#1A1628] flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-[#7C5CFC] flex items-center justify-center">
        <MessageSquare className="w-4 h-4 text-white" />
      </div>
      <span className="text-sm font-bold text-white">AI Tutor</span>
    </div>
    <div className="flex-1 p-6 flex flex-col justify-end gap-4 text-sm">
      <div className="self-end bg-white/10 rounded-2xl rounded-tr-sm px-4 py-3 text-white max-w-[80%]">
        What does useEffect do?
      </div>
      <div className="self-start bg-[#7C5CFC]/20 border border-[#7C5CFC]/30 rounded-2xl rounded-tl-sm px-4 py-3 text-[#b3a1ff] max-w-[85%] leading-relaxed">
        It lets you synchronize a component with an external system. Want an example?
      </div>
    </div>
  </div>
)

const StreakMockup = () => (
  <div className="w-full max-w-sm mx-auto bg-[#120F1D] border border-white/10 rounded-2xl p-8 shadow-2xl text-center relative overflow-hidden">
    <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500 blur-[60px] opacity-20 rounded-full translate-x-1/2 -translate-y-1/2" />
    <Flame className="w-16 h-16 text-orange-500 mx-auto mb-4" />
    <div className="text-4xl font-extrabold text-white mb-2">7 Day Streak!</div>
    <div className="text-sm text-gray-400 mb-6">You're on fire. Keep it up!</div>
    <div className="flex justify-center gap-2">
      {[1,2,3,4,5,6,7].map(day => (
        <div key={day} className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/50 flex items-center justify-center text-xs font-bold text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.3)]">
          ✓
        </div>
      ))}
    </div>
  </div>
)

const steps = [
  { num: '01', title: 'Sign In', desc: 'Create a free account in 5 seconds with Google.', mockup: SignInMockup },
  { num: '02', title: 'Connect API Keys', desc: 'Securely add your YouTube and Gemini API keys (Free tier).', mockup: APIKeysMockup },
  { num: '03', title: 'Import Playlist', desc: 'Paste any YouTube playlist link to create a structured course.', mockup: ImportPlaylistMockup },
  { num: '04', title: 'Start Learning', desc: 'Watch videos directly inside the distraction-free player.', mockup: VideoPlayerMockup },
  { num: '05', title: 'Test Knowledge', desc: 'Ask the AI tutor questions or take an auto-generated quiz.', mockup: AITutorMockup },
  { num: '06', title: 'Build Streaks', desc: 'Return daily to maintain your learning streak and hit your goals.', mockup: StreakMockup },
]

export function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)
  const stepsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (!containerRef.current || !lineRef.current) return

    gsap.registerPlugin(ScrollTrigger)

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top center',
        end: 'bottom center',
        scrub: 1,
      }
    })

    // Draw the vertical line
    tl.fromTo(lineRef.current, 
      { scaleY: 0 },
      { scaleY: 1, transformOrigin: 'top center', ease: 'none' }
    )

    // Highlight each step as the line reaches it
    stepsRef.current.forEach((step, i) => {
      if (!step) return
      
      const dot = step.querySelector('.step-dot')
      const content = step.querySelector('.step-content')
      const mockup = step.querySelector('.step-mockup')

      ScrollTrigger.create({
        trigger: step,
        start: 'top center+=100',
        end: 'bottom center',
        onEnter: () => {
          gsap.to(dot, { backgroundColor: '#7C5CFC', scale: 1.2, duration: 0.3 })
          gsap.to(content, { opacity: 1, x: 0, duration: 0.4, ease: 'back.out(1.7)' })
          if (mockup) gsap.to(mockup, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.5)' })
        },
        onLeaveBack: () => {
          gsap.to(dot, { backgroundColor: 'rgba(255,255,255,0.1)', scale: 1, duration: 0.3 })
          gsap.to(content, { opacity: 0.4, x: i % 2 === 0 ? -20 : 20, duration: 0.3 })
          if (mockup) gsap.to(mockup, { opacity: 0.3, scale: 0.95, duration: 0.3 })
        }
      })
    })

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [])

  return (
    <section className="py-32 relative" id="how-it-works">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-32">
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6">
            How LearnLoop Works
          </h2>
          <p className="text-lg text-[--text-secondary]">
            From a chaotic YouTube playlist to a structured daily learning habit in 6 simple steps.
          </p>
        </div>

        <div ref={containerRef} className="max-w-6xl mx-auto relative pl-8 md:pl-0">
          
          {/* Vertical Progress Line */}
          <div className="absolute left-[20px] md:left-1/2 top-0 bottom-0 w-[2px] bg-white/10 -translate-x-1/2">
            <div ref={lineRef} className="w-full h-full bg-gradient-to-b from-[#7C5CFC] to-blue-500 origin-top" />
          </div>

          <div className="space-y-32 md:space-y-48">
            {steps.map((step, i) => {
              const isEven = i % 2 === 0;
              const Mockup = step.mockup;
              
              return (
                <div 
                  key={step.num} 
                  ref={el => { stepsRef.current[i] = el }}
                  className={`relative flex flex-col md:flex-row items-center justify-between gap-12 md:gap-0 ${isEven ? 'md:flex-row-reverse' : ''}`}
                >
                  
                  {/* Dot */}
                  <div className="absolute left-[-28px] md:left-1/2 w-5 h-5 rounded-full bg-white/10 border-[5px] border-[#05050A] -translate-x-1/2 z-10 step-dot transition-colors duration-300" />

                  {/* Text Content */}
                  <div className={`step-content opacity-40 w-full md:w-[45%] ${isEven ? 'translate-x-5 md:pl-16' : '-translate-x-5 md:pr-16 md:text-right'}`}>
                    <div className="text-[#7C5CFC] font-mono font-bold text-sm mb-3">STEP {step.num}</div>
                    <h3 className="text-3xl md:text-4xl font-bold mb-4">{step.title}</h3>
                    <p className="text-gray-400 leading-relaxed text-base md:text-lg">{step.desc}</p>
                  </div>
                  
                  {/* UI Mockup */}
                  <div className={`step-mockup opacity-30 scale-95 w-full md:w-[50%] ${isEven ? 'md:pr-12' : 'md:pl-12'}`}>
                    <div className="relative">
                      {/* Subdued Glow behind mockup to reduce lag */}
                      <div className="absolute inset-0 bg-[#7C5CFC]/5 blur-[40px] rounded-full" />
                      <div className="relative z-10">
                        <Mockup />
                      </div>
                    </div>
                  </div>

                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
