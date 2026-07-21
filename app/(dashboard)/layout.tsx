import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'

// ─────────────────────────────────────────────────────────────
// Dashboard Layout — wraps all /(dashboard)/* pages
// Contains: Sidebar (desktop) + main content area + orb bg
// ─────────────────────────────────────────────────────────────

import { db } from '@/lib/db'
import { playlists } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { StreakRecoveryModal } from '@/components/dashboard/StreakRecoveryModal'
import { ThemeToggle } from '@/components/common/ThemeToggle'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  // Fetch user's courses (playlists) to show in sidebar
  const userPlaylists = await db
    .select({
      id: playlists.id,
      title: playlists.title,
    })
    .from(playlists)
    .where(eq(playlists.userId, session.user.id))
    .orderBy(desc(playlists.createdAt))

  return (
    <div className="flex h-screen bg-[--bg-primary] overflow-hidden">

      {/* Ambient orb background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-purple-600/[0.15] blur-[100px]" />
        <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full bg-violet-500/[0.12] blur-[80px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-blue-600/[0.06] blur-[60px]" />
      </div>

      {/* Desktop Sidebar */}
      <Sidebar user={session.user} playlists={userPlaylists} />

      {/* Main content area */}
      <main className="flex-1 overflow-hidden flex flex-col min-h-0">

        {/* Mobile top navbar */}
        <MobileNavbar user={session.user} />

        {/* Page content — full width, each page controls its own max-width */}
        <div className="flex-1 w-full min-h-0 overflow-auto px-4 md:px-8 py-6 pb-24 md:pb-8">
          {children}
        </div>

        {/* Mobile bottom nav */}
        <MobileBottomNav />
      </main>
      
      {/* Global Modals */}
      <StreakRecoveryModal />
    </div>
  )
}

// ─── Mobile Navbar ───────────────────────────────────────────
function MobileNavbar({ user }: { user: { name?: string | null; image?: string | null } }) {
  return (
    <nav className="md:hidden sticky top-0 z-50 border-b border-white/[0.06] bg-[--bg-primary]/80 backdrop-blur-xl px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center">
          <span className="text-white font-heading font-bold text-xs">LL</span>
        </div>
        <span className="font-heading font-bold text-sm text-[--text-primary]">LearnLoop</span>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle className="w-8 h-8 rounded-full" />
        {user.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt={user.name ?? 'User'}
            className="w-8 h-8 rounded-full border border-white/[0.10]"
          />
        )}
      </div>
    </nav>
  )
}

// ─── Mobile Bottom Nav ───────────────────────────────────────
import Link from 'next/link'
import { LayoutDashboard, PlusCircle, BarChart2, UserCircle } from 'lucide-react'

function MobileBottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-white/[0.06] bg-[--bg-primary]/90 backdrop-blur-xl px-4 py-2 flex justify-around z-50">
      {[
        { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
        { href: '/import',    icon: PlusCircle,      label: 'Courses' },
        { href: '/activity',  icon: BarChart2,       label: 'Activity' },
        { href: '/profile',   icon: UserCircle,      label: 'Profile' },
      ].map(({ href, icon: Icon, label }) => (
        <Link
          key={href}
          href={href}
          className="flex flex-col items-center gap-1 text-[--text-muted] hover:text-[--text-primary] transition-colors duration-150 p-2"
        >
          <Icon className="w-5 h-5" />
          <span className="text-caption">{label}</span>
        </Link>
      ))}
    </nav>
  )
}
