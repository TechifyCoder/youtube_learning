import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const settingsSchema = z.object({
  reminderEnabled: z.boolean(),
  reminderTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
})

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [user] = await db
      .select({ settings: users.settings })
      .from(users)
      .where(eq(users.id, session.user.id))

    return Response.json(user?.settings || { reminderEnabled: false, reminderTime: '09:00' })
  } catch (error) {
    console.error('[GET /api/settings]', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = settingsSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
    }

    const [updated] = await db.update(users)
      .set({ settings: parsed.data })
      .where(eq(users.id, session.user.id))
      .returning({ settings: users.settings })

    return Response.json(updated?.settings)
  } catch (error) {
    console.error('[PATCH /api/settings]', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
