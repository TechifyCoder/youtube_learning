'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { LayoutDashboard, PlusCircle, ListVideo, LogOut, Award, UserCircle, BarChart2, Settings } from 'lucide-react'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { cn } from '@/lib/utils'
import Image from 'next/image'

// ─────────────────────────────────────────────────────────────
// Sidebar — Desktop only (hidden on mobile)
// From DESIGN.md Section 9
// ─────────────────────────────────────────────────────────────

interface SidebarProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

const NAV_CATEGORIES = [
  {
    title: 'MAIN',
    items: [
      { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ]
  },
  {
    title: 'LEARNING',
    items: [
      { href: '/import',    icon: PlusCircle,       label: 'Import Course'  },
      { href: '/custom',    icon: ListVideo,        label: 'Custom Playlist' },
    ]
  },
  {
    title: 'PROGRESS',
    items: [
      { href: '/activity',  icon: BarChart2,        label: 'Activity' },
    ]
  },
  {
    title: 'ACCOUNT',
    items: [
      { href: '/profile',   icon: UserCircle,       label: 'Profile & Certificates' },
      { href: '/settings',  icon: Settings,         label: 'Settings' },
    ]
  }
]

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex w-60 flex-col border-r border-white/[0.06] bg-white/[0.02] backdrop-blur-sm shrink-0">

      {/* Logo */}
      <div className="h-14 flex items-center gap-3 px-4 border-b border-white/[0.06]">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center shadow-[0_0_12px_rgba(124,92,252,0.4)]">
          <span className="text-white font-heading font-bold text-xs">LL</span>
        </div>
        <span className="font-heading font-bold text-sm text-[--text-primary]">
          LearnLoop
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {NAV_CATEGORIES.map((category) => (
          <div key={category.title}>
            <h4 className="px-3 mb-2 text-[10px] font-bold tracking-wider text-[--text-disabled] uppercase">
              {category.title}
            </h4>
            <div className="space-y-1">
              {category.items.map(({ href, icon: Icon, label }) => {
                const isActive = pathname === href || pathname.startsWith(href + '/')

                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-body-sm font-medium transition-all duration-150',
                      isActive
                        ? 'text-[--text-primary] bg-purple-500/[0.12] border-l-2 border-purple-500 pl-[10px]'
                        : 'text-[--text-muted] hover:text-[--text-secondary] hover:bg-white/[0.04]'
                    )}
                  >
                    <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-purple-400' : '')} />
                    {label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User section */}
      <div className="mt-auto border-t border-white/[0.06] p-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name ?? 'User'}
              width={32}
              height={32}
              className="rounded-full border border-white/[0.10]"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-purple-500/[0.20] flex items-center justify-center border border-purple-500/[0.30]">
              <span className="text-purple-300 text-xs font-medium">
                {user.name?.charAt(0)?.toUpperCase() ?? 'U'}
              </span>
            </div>
          )}

          {/* Name */}
          <div className="flex-1 min-w-0">
            <p className="text-label font-medium text-[--text-primary] truncate">
              {user.name ?? 'User'}
            </p>
            <p className="text-caption text-[--text-muted] truncate">
              {user.email ?? ''}
            </p>
          </div>

          <ThemeToggle />

          {/* Logout */}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[--text-muted] hover:text-red-400 hover:bg-red-500/[0.12] transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
