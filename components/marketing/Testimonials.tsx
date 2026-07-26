'use client'

import { motion } from 'framer-motion'

const testimonials = [
  { quote: "I used to just add videos to 'Watch Later' and never look at them again. LearnLoop actually made me finish a 20-hour React course.", author: "Sarah J.", role: "Frontend Developer" },
  { quote: "The AI tutor is a gamechanger. It's like having the video creator sitting next to you explaining the hard parts.", author: "Michael T.", role: "Computer Science Student" },
  { quote: "Visualizing my progress bar turn green keeps me coming back every day. The streak system works.", author: "David Chen", role: "Self-taught Coder" },
  { quote: "I can finally organize my YouTube learning without getting distracted by the algorithm's recommendations.", author: "Emma W.", role: "Data Analyst" },
]

export function Testimonials() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6">
            Loved by learners
          </h2>
        </div>

        {/* CSS Marquee animation for infinite scroll */}
        <div className="relative flex overflow-x-hidden group">
          <div className="animate-marquee whitespace-nowrap flex gap-6 py-4">
            {testimonials.concat(testimonials).map((t, i) => (
              <div 
                key={i} 
                className="w-[350px] whitespace-normal rounded-2xl border border-white/10 bg-white/5 p-8 flex flex-col justify-between"
              >
                <div className="mb-6">
                  <div className="flex gap-1 mb-4">
                    {[1,2,3,4,5].map(star => <span key={star} className="text-yellow-500 text-sm">★</span>)}
                  </div>
                  <p className="text-sm text-[--text-secondary] leading-relaxed">"{t.quote}"</p>
                </div>
                <div>
                  <div className="font-bold">{t.author}</div>
                  <div className="text-xs text-[--accent-light]">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Gradient edges for fading effect */}
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[--bg-primary] to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[--bg-primary] to-transparent pointer-events-none" />
        </div>
        
      </div>
      
      {/* Inline styles for marquee animation since we aren't modifying tailwind.config.ts */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}} />
    </section>
  )
}
