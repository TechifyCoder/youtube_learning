'use client'

import { useRef, useState } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { Sparkles, LayoutDashboard, FolderPlus, ListVideo, Activity, Moon, Clock, BookOpen, CheckCircle, ChevronDown, Flame, ArrowRight, BrainCircuit, Target } from 'lucide-react'

// Replicating the user's actual dashboard
function DashboardReplica() {
  return (
    <div className="relative w-full aspect-[16/10] bg-[#120F1D] flex select-none text-left">
      {/* Sidebar Mock */}
      <div className="w-[220px] bg-[#0A0812] border-r border-[#2D283E] flex flex-col justify-between py-4 hidden md:flex shrink-0">
        <div>
          <div className="flex items-center gap-2 px-5 mb-8">
            <div className="w-7 h-7 rounded-lg bg-[#7C5CFC] flex items-center justify-center">
              <span className="text-[11px] font-extrabold text-white">LL</span>
            </div>
            <span className="font-bold text-base text-white tracking-wide">LearnLoop</span>
          </div>
          
          <div className="px-4 mb-8">
            <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">Main</div>
            <div className="flex items-center gap-3 bg-[#2D283E] text-white px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer">
              <LayoutDashboard className="w-4 h-4 text-[#7C5CFC]" /> Dashboard
            </div>
          </div>

          <div className="px-4 mb-8 space-y-1.5">
            <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">Learning</div>
            <div className="flex items-center gap-3 text-gray-400 hover:text-white px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer hover:bg-white/5">
              <FolderPlus className="w-4 h-4" /> Import Course
            </div>
            <div className="flex items-center gap-3 text-gray-400 hover:text-white px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer hover:bg-white/5">
              <ListVideo className="w-4 h-4" /> Custom Playlist
            </div>
          </div>

          <div className="px-4 mb-8">
            <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">Progress</div>
            <div className="flex items-center gap-3 text-gray-400 hover:text-white px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer hover:bg-white/5">
              <Activity className="w-4 h-4" /> Activity
            </div>
          </div>
        </div>

        {/* User Profile Area */}
        <div className="px-4">
          <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500/20 to-purple-500/20 flex items-center justify-center text-blue-400 text-xs font-bold border border-blue-500/30">
                SP
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-white font-semibold">Satish Patel</span>
                <span className="text-[10px] text-gray-500">satish@example.com</span>
              </div>
            </div>
            <Moon className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Main Content Mock */}
      <div className="flex-1 bg-[#120F1D] p-8 flex flex-col gap-6 overflow-hidden">
        {/* Header */}
        <div className="mb-2">
          <h2 className="text-3xl font-bold text-white mb-2">Dashboard</h2>
          <p className="text-xs text-gray-400">Welcome back! Here's what's happening with your courses.</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#1A1628] rounded-2xl p-4 border border-white/5 flex items-center gap-4 hover:border-white/10 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-white font-bold text-xl">7</div>
              <div className="text-gray-400 text-xs font-medium">Hours Watched</div>
            </div>
          </div>
          <div className="bg-[#1A1628] rounded-2xl p-4 border border-white/5 flex items-center gap-4 hover:border-white/10 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0 border border-purple-500/20">
              <BookOpen className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="text-white font-bold text-xl">1</div>
              <div className="text-gray-400 text-xs font-medium">Active Courses</div>
            </div>
          </div>
          <div className="bg-[#1A1628] rounded-2xl p-4 border border-white/5 flex items-center gap-4 hover:border-white/10 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0 border border-green-500/20">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-white font-bold text-xl">1</div>
              <div className="text-gray-400 text-xs font-medium">Completed Courses</div>
            </div>
          </div>
        </div>

        {/* Main Area */}
        <div className="flex gap-6 h-[220px]">
          {/* Heatmap Area */}
          <div className="flex-[2] bg-[#1A1628] rounded-2xl p-6 border border-white/5 flex flex-col relative overflow-hidden group hover:border-white/10 transition-colors">
             <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Activity Heatmap</div>
             <div className="flex items-center justify-between mb-6">
               <span className="text-base font-bold text-white">Learning Activity</span>
               <div className="text-xs font-medium text-gray-400 bg-white/5 hover:bg-white/10 transition-colors px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer">
                 Last Year <ChevronDown className="w-4 h-4"/>
               </div>
             </div>
             {/* Fake Heatmap grid */}
             <div className="flex-1 w-full grid grid-cols-[repeat(25,1fr)] gap-1 opacity-80">
                {Array.from({ length: 125 }).map((_, i) => {
                  const rand = Math.random();
                  const color = rand > 0.85 ? 'bg-[#7C5CFC]' : rand > 0.92 ? 'bg-blue-400' : rand > 0.7 ? 'bg-[#4B3B8C]' : 'bg-white/5';
                  return (
                    <motion.div 
                      key={i} 
                      whileHover={{ scale: 1.5, zIndex: 10 }}
                      className={`w-full aspect-square rounded-[2px] ${color} transition-all duration-300 cursor-pointer hover:shadow-[0_0_10px_rgba(124,92,252,0.8)]`} 
                    />
                  )
                })}
             </div>
             {/* Decorative glow */}
             <div className="absolute bottom-0 right-0 w-40 h-40 bg-[#7C5CFC] blur-[60px] opacity-10 rounded-full group-hover:opacity-20 transition-opacity duration-700" />
          </div>

          {/* Catch Up Box */}
          <div className="flex-1 bg-gradient-to-b from-[#2A1525] to-[#1A1628] rounded-2xl p-6 border border-red-500/20 flex flex-col justify-between hover:border-red-500/40 transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-[40px] rounded-full pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-red-400 text-xs font-bold mb-3 bg-red-500/10 w-fit px-2 py-1 rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" /> You're behind!
              </div>
              <div className="text-2xl font-extrabold text-white leading-tight mb-2">Watch 64 min</div>
              <p className="text-xs text-gray-300 leading-relaxed opacity-90 line-clamp-2">Up next: JavaScript Proxy and Reflect Objects, JavaScript HARD Interview Questions</p>
            </div>
            <button className="w-full bg-[#7C5CFC] hover:bg-[#684be3] text-white text-xs font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(124,92,252,0.3)] hover:shadow-[0_0_25px_rgba(124,92,252,0.5)]">
              Catch Up Now <motion.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}><ArrowRight className="w-4 h-4" /></motion.span>
            </button>
          </div>
        </div>

        {/* Bottom Area */}
        <div className="grid grid-cols-2 gap-6 flex-1 min-h-[140px]">
           <div className="bg-[#1A1628] rounded-2xl p-6 border border-white/5 relative overflow-hidden hover:border-white/10 transition-colors group">
             <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 relative z-10">
                <Flame className="w-4 h-4 text-orange-500" /> Current Streak
             </div>
             <div className="text-4xl font-extrabold text-white relative z-10">
               1 <span className="text-base font-medium text-gray-400 tracking-normal">days</span>
             </div>
             <div className="absolute bottom-0 right-0 w-32 h-32 bg-orange-500 blur-[40px] opacity-10 rounded-full translate-x-1/3 translate-y-1/3 group-hover:opacity-20 transition-opacity duration-700" />
           </div>
           <div className="bg-[#1A1628] rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center relative overflow-hidden hover:border-white/10 transition-colors group">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
             <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest absolute top-5 left-5">Focus Tracker</div>
             <div className="text-4xl font-extrabold text-white font-mono mt-2 tracking-tight">00:00</div>
             <div className="text-xs font-medium text-gray-400 mt-2">Current Session</div>
           </div>
        </div>
      </div>
    </div>
  )
}

export function InteractiveProductPreview() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end center"]
  })

  // Smooth scroll animations
  const smoothProgress = useSpring(scrollYProgress, { damping: 20, stiffness: 100 })
  
  const scale = useTransform(smoothProgress, [0, 1], [0.85, 1])
  const rotateX = useTransform(smoothProgress, [0, 1], [15, 0])
  const opacity = useTransform(smoothProgress, [0, 0.5, 1], [0, 0.5, 1])
  const y = useTransform(smoothProgress, [0, 1], [100, 0])

  // Mouse Parallax Effect for floating elements
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setMousePosition({ x, y })
  }

  return (
    <section 
      ref={containerRef} 
      className="relative w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-20 z-20"
      onMouseMove={handleMouseMove}
    >
      <motion.div
        style={{ 
          scale, 
          rotateX,
          opacity,
          y,
          transformPerspective: 1200,
        }}
        className="relative w-full shadow-2xl rounded-2xl border border-white/10 bg-[#0A0812] overflow-hidden group"
      >
        {/* Mock macOS Window Header */}
        <div className="w-full h-12 bg-[#1A1628] border-b border-white/10 flex items-center px-4 gap-2 relative z-20">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
            <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 text-xs font-medium text-gray-500 hidden sm:flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-md">
            learnloop.app
          </div>
        </div>
        
        {/* The Dashboard App */}
        <DashboardReplica />

        {/* Floating AI Badge - Parallax */}
        <motion.div 
          animate={{ 
            x: mousePosition.x * -40, 
            y: mousePosition.y * -40 
          }}
          transition={{ type: "spring", stiffness: 100, damping: 25 }}
          className="absolute -bottom-6 -left-6 md:bottom-16 md:-left-12 bg-[#1A1628]/90 backdrop-blur-xl border border-white/20 px-5 py-4 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex items-center gap-4 z-30"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#7C5CFC] to-blue-500 flex items-center justify-center shadow-inner">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-white mb-0.5">AI Quiz Generator</div>
            <div className="text-xs font-medium text-gray-400">Tests created from video transcripts</div>
          </div>
        </motion.div>

        {/* Floating Progress Badge - Parallax */}
        <motion.div 
          animate={{ 
            x: mousePosition.x * 30, 
            y: mousePosition.y * 30 
          }}
          transition={{ type: "spring", stiffness: 100, damping: 25 }}
          className="absolute -top-6 -right-6 md:top-16 md:-right-12 bg-[#1A1628]/90 backdrop-blur-xl border border-white/20 px-5 py-4 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex items-center gap-4 z-30"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-400 to-emerald-600 flex items-center justify-center shadow-inner">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-white mb-0.5">Smart Tracking</div>
            <div className="text-xs font-medium text-gray-400">Keep your daily streak alive</div>
          </div>
        </motion.div>

        {/* Ambient Glow behind the dashboard */}
        <div className="absolute inset-0 z-[-1] bg-gradient-to-tr from-[#7C5CFC]/20 via-transparent to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-3xl pointer-events-none" />
      </motion.div>
    </section>
  )
}
