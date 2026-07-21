import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq, and, ne } from 'drizzle-orm'
import { z } from 'zod'

const patchSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores allowed').optional().nullable(),
  bio: z.string().max(160).optional().nullable(),
  isPublic: z.boolean().optional(),
})

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = patchSchema.safeParse(body)
    
    if (!parsed.success) {
      return Response.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
    }

    const { username, bio, isPublic } = parsed.data
    const updateData: any = {}
    
    if (username !== undefined) {
      // check if username is already taken by someone else
      if (username) {
        const [existing] = await db.select().from(users).where(eq(users.username, username)).limit(1)
        if (existing && existing.id !== session.user.id) {
          return Response.json({ error: 'Username is already taken' }, { status: 400 })
        }
      }
      updateData.username = username
    }
    
    if (bio !== undefined) updateData.bio = bio
    if (isPublic !== undefined) updateData.isPublic = isPublic

    if (Object.keys(updateData).length > 0) {
      await db.update(users).set(updateData).where(eq(users.id, session.user.id))
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('[PATCH /api/profile]', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
