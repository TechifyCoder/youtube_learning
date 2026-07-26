'use client'

import { useRef, useEffect } from 'react'
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, PlayCircle, Sparkles, LayoutDashboard, FolderPlus, ListVideo, Activity, Moon, Clock, BookOpen, CheckCircle, ChevronDown, Flame, CheckCircle2, User, Target } from 'lucide-react'
import { gsap } from 'gsap'

// Replicating the user's actual dashboard for the hero graphic
function DashboardReplica() {
  return (
    <div className="relative w-full aspect-[16/10] bg-[#120F1D] flex select-none text-left">
      {/* Sidebar Mock */}
      <div className="w-[180px] bg-[#0A0812] border-r border-[#2D283E] flex flex-col justify-between py-4 hidden md:flex shrink-0">
        <div>
          <div className="flex items-center gap-2 px-4 mb-8">
            <div className="w-6 h-6 rounded-md bg-[#7C5CFC] flex items-center justify-center">
              <span className="text-[9px] font-extrabold text-white">LL</span>
            </div>
            <span className="font-bold text-xs text-white tracking-wide">LearnLoop</span>
          </div>
          
          <div className="px-3 mb-6">
            <div className="text-[8px] font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Main</div>
            <div className="flex items-center gap-2 bg-[#2D283E] text-white px-3 py-2 rounded-lg text-xs font-medium cursor-pointer">
              <LayoutDashboard className="w-3.5 h-3.5 text-[#7C5CFC]" /> Dashboard
            </div>
          </div>

          <div className="px-3 mb-6 space-y-1">
            <div className="text-[8px] font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Learning</div>
            <div className="flex items-center gap-2 text-gray-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer hover:bg-white/5">
              <FolderPlus className="w-3.5 h-3.5" /> Import Course
            </div>
            <div className="flex items-center gap-2 text-gray-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer hover:bg-white/5">
              <ListVideo className="w-3.5 h-3.5" /> Custom Playlist
            </div>
          </div>

          <div className="px-3 mb-6">
            <div className="text-[8px] font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Progress</div>
            <div className="flex items-center gap-2 text-gray-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer hover:bg-white/5">
              <Activity className="w-3.5 h-3.5" /> Activity
            </div>
          </div>
        </div>

        {/* User Profile Area */}
        <div className="px-3">
          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500/20 to-purple-500/20 flex items-center justify-center text-blue-400 text-[10px] font-bold border border-blue-500/30">
                SP
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-white font-semibold">Satish Patel</span>
                <span className="text-[8px] text-gray-500">satish@example.com</span>
              </div>
            </div>
            <Moon className="w-3 h-3 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Main Content Mock */}
      <div className="flex-1 bg-[#120F1D] p-5 flex flex-col gap-4 overflow-hidden">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Dashboard</h2>
          <p className="text-[9px] text-gray-400">Welcome back! Here's what's happening with your courses.</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#1A1628] rounded-xl p-3 border border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">7</div>
              <div className="text-gray-400 text-[9px] font-medium">Hours Watched</div>
            </div>
          </div>
          <div className="bg-[#1A1628] rounded-xl p-3 border border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0 border border-purple-500/20">
              <BookOpen className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">1</div>
              <div className="text-gray-400 text-[9px] font-medium">Active Courses</div>
            </div>
          </div>
          <div className="bg-[#1A1628] rounded-xl p-3 border border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0 border border-green-500/20">
              <CheckCircle className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">1</div>
              <div className="text-gray-400 text-[9px] font-medium">Completed Courses</div>
            </div>
          </div>
        </div>

        {/* Main Area */}
        <div className="flex gap-4 h-[140px]">
          {/* Heatmap Area */}
          <div className="flex-[2] bg-[#1A1628] rounded-xl p-4 border border-white/5 flex flex-col relative overflow-hidden group">
             <div className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-3">Activity Heatmap</div>
             <div className="flex items-center justify-between mb-4">
               <span className="text-xs font-bold text-white">Learning Activity</span>
               <div className="text-[9px] font-medium text-gray-400 bg-white/5 px-2 py-1 rounded flex items-center gap-1">
                 Last Year <ChevronDown className="w-3 h-3"/>
               </div>
             </div>
             {/* Fake Heatmap grid */}
             <div className="flex-1 w-full grid grid-cols-[repeat(20,1fr)] gap-0.5 opacity-80">
                {Array.from({ length: 60 }).map((_, i) => {
                  const rand = Math.random();
                  const color = rand > 0.85 ? 'bg-[#7C5CFC]' : rand > 0.92 ? 'bg-blue-400' : rand > 0.7 ? 'bg-[#4B3B8C]' : 'bg-white/5';
                  return (
                    <div key={i} className={`w-full aspect-square rounded-[1px] ${color}`} />
                  )
                })}
             </div>
             <div className="absolute bottom-0 right-0 w-24 h-24 bg-[#7C5CFC] blur-[40px] opacity-10 rounded-full" />
          </div>

          {/* Catch Up Box */}
          <div className="flex-1 bg-gradient-to-b from-[#2A1525] to-[#1A1628] rounded-xl p-4 border border-red-500/20 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 blur-[30px] rounded-full pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-1.5 text-red-400 text-[9px] font-bold mb-2 bg-red-500/10 w-fit px-1.5 py-0.5 rounded">
                <span className="w-1 h-1 rounded-full bg-red-400 animate-pulse" /> You're behind!
              </div>
              <div className="text-base font-extrabold text-white leading-tight mb-1">Watch 64 min</div>
              <p className="text-[8px] text-gray-300 opacity-90 line-clamp-2">Up next: JavaScript Proxy and Reflect...</p>
            </div>
            <button className="w-full bg-[#7C5CFC] text-white text-[9px] font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 shadow-[0_0_10px_rgba(124,92,252,0.3)]">
              Catch Up <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Bottom Area */}
        <div className="grid grid-cols-2 gap-4 flex-1">
           <div className="bg-[#1A1628] rounded-xl p-4 border border-white/5 relative overflow-hidden">
             <div className="flex items-center gap-1.5 text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-2 relative z-10">
                <Flame className="w-3 h-3 text-orange-500" /> Current Streak
             </div>
             <div className="text-2xl font-extrabold text-white relative z-10">
               1 <span className="text-xs font-medium text-gray-400 tracking-normal">days</span>
             </div>
             <div className="absolute bottom-0 right-0 w-20 h-20 bg-orange-500 blur-[30px] opacity-10 rounded-full translate-x-1/3 translate-y-1/3" />
           </div>
           <div className="bg-[#1A1628] rounded-xl p-4 border border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
             <div className="text-[8px] font-bold text-gray-500 uppercase tracking-widest absolute top-3 left-3">Focus Tracker</div>
             <div className="text-2xl font-extrabold text-white font-mono mt-2 tracking-tight">00:00</div>
             <div className="text-[9px] font-medium text-gray-400 mt-1">Current Session</div>
           </div>
        </div>
      </div>
    </div>
  )
}

export function HeroSection({ isLoggedIn }: { isLoggedIn: boolean }) {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 800], [0, 150])
  const opacity = useTransform(scrollY, [0, 400], [1, 0])

  const headlineRef = useRef<HTMLHeadingElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // High-performance parallax using framer-motion values (bypasses React state)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  const springConfig = { damping: 25, stiffness: 100 }
  const x1 = useSpring(useTransform(mouseX, [-0.5, 0.5], [-30, 30]), springConfig)
  const y1 = useSpring(useTransform(mouseY, [-0.5, 0.5], [-30, 30]), springConfig)
  
  const x2 = useSpring(useTransform(mouseX, [-0.5, 0.5], [20, -20]), springConfig)
  const y2 = useSpring(useTransform(mouseY, [-0.5, 0.5], [20, -20]), springConfig)

  useEffect(() => {
    if (headlineRef.current) {
      gsap.fromTo(headlineRef.current.children, 
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 0.1 }
      )
    }
  }, [])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5)
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-24 pb-16 px-4 overflow-hidden" ref={containerRef} onMouseMove={handleMouseMove}>
      <motion.div 
        style={{ y, opacity }}
        className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 max-w-[1400px] flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8 min-h-[70vh]"
      >
        
        {/* Left Column - Content */}
        <div className="flex-1 flex flex-col items-start text-left max-w-2xl pt-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-6 text-sm font-medium text-[#7C5CFC] shadow-[0_0_20px_rgba(124,92,252,0.15)]"
          >
            <Sparkles className="w-4 h-4 text-[#7C5CFC]" />
            Smarter learning from YouTube
          </motion.div>

          <h1 ref={headlineRef} className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-[4.5rem] font-extrabold tracking-tight text-white mb-6 leading-[1.05]">
            <span className="block">Stop Watching.</span>
            <span className="block mt-1">Start <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9F85FF] to-[#7C5CFC]">Learning.</span></span>
          </h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg sm:text-xl text-gray-400 max-w-xl mb-10 text-balance leading-relaxed"
          >
            LearnLoop turns chaotic YouTube playlists into structured daily learning plans. 
            Track progress, take AI-generated quizzes, and build consistent study streaks.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-10"
          >
            <Link href={isLoggedIn ? "/dashboard" : "/login"} className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 py-4 bg-[#7C5CFC] hover:bg-[#684be3] text-white rounded-xl font-bold text-[15px] transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(124,92,252,0.4)] hover:shadow-[0_0_40px_rgba(124,92,252,0.6)] hover:-translate-y-0.5">
                {isLoggedIn ? 'Go to Dashboard' : 'Start Learning Free'} 
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            
            <button className="w-full sm:w-auto px-8 py-4 bg-transparent hover:bg-white/5 text-white border border-white/10 rounded-xl font-medium text-[15px] transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-md hover:-translate-y-0.5">
              <PlayCircle className="w-4 h-4 text-gray-400" />
              Watch Demo
            </button>
          </motion.div>

          {/* Trust badges */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-wrap items-center gap-6 text-[13px] text-gray-400 font-medium"
          >
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#7C5CFC]" /> Free to get started
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#7C5CFC]" /> No credit card required
            </div>
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-[#7C5CFC]" /> Loved by learners
            </div>
          </motion.div>
        </div>

        {/* Right Column - Dashboard Replica */}
        <motion.div 
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          className="flex-1 w-full lg:w-auto relative perspective-1000 mt-12 lg:mt-0 max-w-3xl"
        >
          <div className="relative w-full shadow-[0_0_50px_rgba(124,92,252,0.15)] rounded-2xl border border-white/10 bg-[#0A0812] overflow-hidden transform lg:rotate-y-[-5deg] lg:rotate-x-[2deg] hover:rotate-y-0 hover:rotate-x-0 transition-transform duration-700 group z-10">
            {/* Mock macOS Window Header */}
            <div className="w-full h-8 bg-[#1A1628] border-b border-white/10 flex items-center px-3 gap-1.5 relative z-20">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
            </div>
            
            <DashboardReplica />

            {/* Ambient Glow behind the dashboard */}
            <div className="absolute inset-0 z-[-1] bg-gradient-to-tr from-[#7C5CFC]/20 via-transparent to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-2xl pointer-events-none" />
          </div>

          {/* Floating AI Badge - Parallax */}
          <motion.div 
            style={{ x: x1, y: y1 }}
            className="absolute -bottom-4 -left-4 md:bottom-8 md:-left-8 bg-[#1A1628]/90 backdrop-blur-xl border border-white/20 px-4 py-3 rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.4)] flex items-center gap-3 z-30"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#7C5CFC] to-blue-500 flex items-center justify-center shadow-inner">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-white mb-0.5">AI Quiz Generator</div>
              <div className="text-[10px] font-medium text-gray-400">Tests from video transcripts</div>
            </div>
          </motion.div>

          {/* Floating Progress Badge - Parallax */}
          <motion.div 
            style={{ x: x2, y: y2 }}
            className="absolute -top-4 -right-4 md:top-8 md:-right-6 bg-[#1A1628]/90 backdrop-blur-xl border border-white/20 px-4 py-3 rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.4)] flex items-center gap-3 z-30"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-400 to-emerald-600 flex items-center justify-center shadow-inner">
              <Target className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-white mb-0.5">Smart Tracking</div>
              <div className="text-[10px] font-medium text-gray-400">Keep your streak alive</div>
            </div>
          </motion.div>

        </motion.div>
      </motion.div>
    </section>
  )
}
