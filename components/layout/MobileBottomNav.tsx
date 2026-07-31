'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  PlusCircle,
  BarChart2,
  MoreHorizontal,
  ListVideo,
  BrainCircuit,
  UserCircle,
  Settings,
  Award,
  LogOut,
  ChevronRight,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

// ─────────────────────────────────────────────────────────────
// MobileBottomNav — Client component with active-state
// Last tab = "More" → full-screen sheet with all nav items
// ─────────────────────────────────────────────────────────────

const BOTTOM_NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/import',    icon: PlusCircle,      label: 'Courses' },
  { href: '/activity',  icon: BarChart2,       label: 'Activity' },
]

const MORE_SECTIONS = [
  {
    title: 'Learning',
    items: [
      { href: '/import',  icon: PlusCircle,   label: 'Import Course',        desc: 'Add a YouTube playlist' },
      { href: '/custom',  icon: ListVideo,    label: 'Custom Playlist',      desc: 'Build your own playlist' },
    ],
  },
  {
    title: 'Progress',
    items: [
      { href: '/activity', icon: BarChart2,   label: 'Activity',             desc: 'View your learning history' },
      { href: '/quizzes',  icon: BrainCircuit,label: 'Quizzes',              desc: 'Test your knowledge' },
    ],
  },
  {
    title: 'Account',
    items: [
      { href: '/profile',  icon: UserCircle,  label: 'Profile & Certificates', desc: 'View your profile & certs' },
      { href: '/settings', icon: Settings,    label: 'Settings',             desc: 'API keys & preferences' },
    ],
  },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const [showMore, setShowMore] = useState(false)

  // Check if any "More" item is active
  const moreHrefs = MORE_SECTIONS.flatMap(s => s.items.map(i => i.href))
  const isMoreActive = moreHrefs.some(
    href => pathname === href || pathname.startsWith(href + '/')
  )

  return (
    <>
      {/* ── Bottom Nav Bar ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-white/[0.06] bg-[--bg-primary]/95 backdrop-blur-xl flex justify-around z-40"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {BOTTOM_NAV.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setShowMore(false)}
              className={cn(
                'flex flex-col items-center gap-1 py-3 px-4 transition-colors duration-150 min-w-0 flex-1',
                isActive ? 'text-[--accent]' : 'text-[--text-muted]'
              )}
            >
              <div className="relative">
                <Icon className={cn('w-5 h-5', isActive && 'drop-shadow-[0_0_8px_rgba(124,92,252,0.9)]')} />
                {isActive && (
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[--accent]" />
                )}
              </div>
              <span className={cn('text-[10px] font-medium leading-none mt-0.5', isActive ? 'text-[--accent]' : '')}>
                {label}
              </span>
            </Link>
          )
        })}

        {/* More Button */}
        <button
          onClick={() => setShowMore(prev => !prev)}
          className={cn(
            'flex flex-col items-center gap-1 py-3 px-4 transition-colors duration-150 min-w-0 flex-1',
            (showMore || isMoreActive) ? 'text-[--accent]' : 'text-[--text-muted]'
          )}
        >
          <div className="relative">
            <MoreHorizontal className={cn('w-5 h-5', (showMore || isMoreActive) && 'drop-shadow-[0_0_8px_rgba(124,92,252,0.9)]')} />
            {(showMore || isMoreActive) && (
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[--accent]" />
            )}
          </div>
          <span className={cn('text-[10px] font-medium leading-none mt-0.5', (showMore || isMoreActive) ? 'text-[--accent]' : '')}>
            More
          </span>
        </button>
      </nav>

      {/* ── More Sheet (slide up) ── */}
      <AnimatePresence>
        {showMore && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setShowMore(false)}
            />

            {/* Sheet */}
            <motion.div
              key="sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="md:hidden fixed left-0 right-0 bottom-0 z-50 bg-[--bg-card] rounded-t-3xl border-t border-white/[0.08] shadow-2xl overflow-hidden"
              style={{ maxHeight: '85vh', paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
            >
              {/* Sheet Handle */}
              <div className="flex flex-col items-center pt-3 pb-2 shrink-0">
                <div className="w-10 h-1 rounded-full bg-white/20" />
              </div>

              {/* Sheet Header */}
              <div className="flex items-center justify-between px-5 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center shadow-[0_0_12px_rgba(124,92,252,0.5)]">
                    <span className="text-white font-bold text-xs">LL</span>
                  </div>
                  <h2 className="font-heading font-semibold text-base text-[--text-primary]">All Features</h2>
                </div>
                <button
                  onClick={() => setShowMore(false)}
                  className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-[--text-muted] hover:text-[--text-primary] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto px-4 pb-4 space-y-5" style={{ maxHeight: 'calc(85vh - 100px)' }}>
                {MORE_SECTIONS.map((section) => (
                  <div key={section.title}>
                    <p className="text-[10px] font-bold tracking-widest text-[--text-disabled] uppercase mb-2 px-1">
                      {section.title}
                    </p>
                    <div className="space-y-1.5">
                      {section.items.map(({ href, icon: Icon, label, desc }) => {
                        const isActive = pathname === href || pathname.startsWith(href + '/')
                        return (
                          <Link
                            key={href}
                            href={href}
                            onClick={() => setShowMore(false)}
                            className={cn(
                              'flex items-center gap-4 p-3.5 rounded-2xl transition-all duration-150 group',
                              isActive
                                ? 'bg-purple-500/[0.12] border border-purple-500/30'
                                : 'bg-white/[0.03] border border-transparent hover:bg-white/[0.06] hover:border-white/[0.06]'
                            )}
                          >
                            {/* Icon */}
                            <div className={cn(
                              'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                              isActive ? 'bg-purple-500/20' : 'bg-white/[0.06]'
                            )}>
                              <Icon className={cn('w-5 h-5', isActive ? 'text-purple-400' : 'text-[--text-secondary]')} />
                            </div>

                            {/* Text */}
                            <div className="flex-1 min-w-0">
                              <p className={cn(
                                'text-sm font-semibold',
                                isActive ? 'text-[--text-primary]' : 'text-[--text-secondary] group-hover:text-[--text-primary]'
                              )}>
                                {label}
                              </p>
                              <p className="text-xs text-[--text-muted] mt-0.5 truncate">{desc}</p>
                            </div>

                            {/* Arrow */}
                            <ChevronRight className={cn(
                              'w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5',
                              isActive ? 'text-purple-400' : 'text-[--text-disabled]'
                            )} />
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                ))}

                {/* Divider */}
                <div className="h-px bg-white/[0.06] mx-1" />

                {/* Sign Out */}
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="w-full flex items-center gap-4 p-3.5 rounded-2xl bg-red-500/[0.06] border border-red-500/20 hover:bg-red-500/[0.12] transition-all duration-150 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                    <LogOut className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-red-400">Sign Out</p>
                    <p className="text-xs text-[--text-muted] mt-0.5">Log out of LearnLoop</p>
                  </div>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
