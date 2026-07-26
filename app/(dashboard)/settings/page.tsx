import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { SettingsForm } from './SettingsForm'
import { PlanSettings } from './PlanSettings'
import { ApiKeysSettings } from './ApiKeysSettings'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export const metadata = {
  title: 'Settings - LearnLoop',
}

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) return redirect('/login')

  const [user] = await db
    .select({ 
      settings: users.settings,
      mode: users.mode,
      plan: users.plan,
      planExpiresAt: users.planExpiresAt,
      youtubeApiKey: users.youtubeApiKey,
      geminiApiKey: users.geminiApiKey,
      byokDatabaseUrl: users.byokDatabaseUrl
    })
    .from(users)
    .where(eq(users.id, session.user.id))

  const initialSettings = user?.settings as { reminderEnabled: boolean, reminderTime: string }

  return (
    <PageWrapper className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="font-heading font-bold text-3xl text-[--text-primary] mb-2">
          Settings
        </h1>
        <p className="text-[--text-secondary]">
          Manage your API keys, notifications, and app preferences.
        </p>
      </div>

      <PlanSettings 
        mode={user?.mode || 'byok'}
        plan={user?.plan || 'free'}
        planExpiresAt={user?.planExpiresAt || null}
        hasYoutubeKey={!!user?.youtubeApiKey}
        hasGeminiKey={!!user?.geminiApiKey}
        hasDbUrl={!!user?.byokDatabaseUrl}
      />

      {/* API Keys section — only shown in BYOK mode */}
      {(user?.mode === 'byok' || !user?.mode) && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <ApiKeysSettings />
        </div>
      )}

      <SettingsForm initialSettings={initialSettings || { reminderEnabled: false, reminderTime: '09:00' }} />
    </PageWrapper>
  )
}

