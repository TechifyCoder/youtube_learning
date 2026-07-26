import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { OnboardingClient } from './OnboardingClient'
import { isEarlyAccessUser } from '@/lib/earlyAccess'

export const metadata = {
  title: 'Welcome to LearnLoop',
}

export default async function OnboardingPage() {
  const session = await auth()
  if (!session?.user?.id) return redirect('/login')

  const [user] = await db
    .select({ 
      onboardingComplete: users.onboardingComplete,
      name: users.name
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)

  // If onboarding already done, go to dashboard
  if (user?.onboardingComplete) {
    return redirect('/dashboard')
  }

  const earlyAccess = await isEarlyAccessUser(session.user.id)

  return (
    <div className="min-h-screen bg-[--bg-primary] flex flex-col">
      {/* Ambient background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-purple-600/[0.15] blur-[100px]" />
        <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full bg-violet-500/[0.12] blur-[80px]" />
      </div>

      {/* Header */}
      <header className="flex items-center gap-3 px-8 py-5 border-b border-white/[0.06]">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center">
          <span className="text-white font-bold text-sm">LL</span>
        </div>
        <span className="font-bold text-lg tracking-tight">LearnLoop</span>
      </header>

      {/* Onboarding content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <OnboardingClient 
            userName={user?.name ?? session.user.name ?? 'there'} 
            isEarlyAccess={earlyAccess}
          />
        </div>
      </main>
    </div>
  )
}
