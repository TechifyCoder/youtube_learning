import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { SettingsForm } from './SettingsForm'
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
    .select({ settings: users.settings })
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
          Manage your notifications and app preferences.
        </p>
      </div>

      <SettingsForm initialSettings={initialSettings || { reminderEnabled: false, reminderTime: '09:00' }} />
    </PageWrapper>
  )
}
