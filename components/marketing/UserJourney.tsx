'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function UserJourney() {
  const containerRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pathRef.current || !containerRef.current || !wrapperRef.current) return

    gsap.registerPlugin(ScrollTrigger)

    const pathLength = pathRef.current.getTotalLength()
    
    // Set initial stroke setup
    gsap.set(pathRef.current, {
      strokeDasharray: pathLength,
      strokeDashoffset: pathLength
    })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: wrapperRef.current,
        start: "top center",
        end: "bottom center",
        scrub: 1,
      }
    })

    tl.to(pathRef.current, {
      strokeDashoffset: 0,
      ease: "none"
    })

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [])

  return (
    <section className="py-32 relative overflow-hidden" ref={containerRef}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6">
            The path to mastery
          </h2>
          <p className="text-lg text-[--text-secondary]">
            Watch your progress visually unfold as you complete videos, pass quizzes, and build your streak.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto" ref={wrapperRef}>
          {/* Decorative background grid */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 pointer-events-none" />

          <svg viewBox="0 0 800 400" className="w-full h-auto drop-shadow-[0_0_15px_rgba(124,92,252,0.5)]">
            {/* Background Path */}
            <path 
              d="M 50,50 C 200,50 300,350 500,350 C 650,350 700,200 750,50" 
              fill="none" 
              stroke="rgba(255,255,255,0.1)" 
              strokeWidth="12" 
              strokeLinecap="round" 
            />
            
            {/* Animated Path */}
            <path 
              ref={pathRef}
              d="M 50,50 C 200,50 300,350 500,350 C 650,350 700,200 750,50" 
              fill="none" 
              stroke="url(#gradient)" 
              strokeWidth="12" 
              strokeLinecap="round" 
            />

            {/* Nodes */}
            <circle cx="50" cy="50" r="16" fill="#1A1628" stroke="#7C5CFC" strokeWidth="6" />
            <circle cx="256" cy="200" r="12" fill="#1A1628" stroke="#48BB78" strokeWidth="4" />
            <circle cx="500" cy="350" r="16" fill="#1A1628" stroke="#7C5CFC" strokeWidth="6" />
            <circle cx="663" cy="256" r="12" fill="#1A1628" stroke="#F59E0B" strokeWidth="4" />
            <circle cx="750" cy="50" r="20" fill="#7C5CFC" className="animate-pulse" />

            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="50%" stopColor="#7C5CFC" />
                <stop offset="100%" stopColor="#48BB78" />
              </linearGradient>
            </defs>
          </svg>

          {/* Labels */}
          <div className="absolute top-[10%] left-[5%] -translate-y-full text-sm font-bold">Start</div>
          <div className="absolute top-[80%] left-[62%] -translate-x-1/2 text-sm font-bold text-[--text-secondary]">Midpoint Quiz</div>
          <div className="absolute top-[10%] right-[5%] -translate-y-full text-sm font-bold text-[--accent-lighter]">Course Completed</div>

        </div>
      </div>
    </section>
  )
}
