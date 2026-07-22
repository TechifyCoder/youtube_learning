import { z } from 'zod'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { scheduleDays, playlists } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

// ─────────────────────────────────────────────────────────────
// PATCH /api/schedule/[dayId]
// Mark a specific schedule day as completed
// ─────────────────────────────────────────────────────────────

export async function PATCH(
  req: Request,
  { params }: { params: { dayId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ensure we own the day by joining playlists
    const [day] = await db
      .select({ id: scheduleDays.id })
      .from(scheduleDays)
      .innerJoin(playlists, eq(scheduleDays.playlistId, playlists.id))
      .where(and(eq(scheduleDays.id, params.dayId), eq(playlists.userId, session.user.id)))
      .limit(1)

    if (!day) {
      return Response.json({ error: 'Schedule day not found' }, { status: 404 })
    }

    await db
      .update(scheduleDays)
      .set({
        isCompleted: true,
        status: 'completed',
      })
      .where(eq(scheduleDays.id, params.dayId))

    return Response.json({ success: true })
  } catch (error) {
    console.error('[PATCH /api/schedule/[dayId]]', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
