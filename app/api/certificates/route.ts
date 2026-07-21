import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { certificates } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'
import { generateShareToken, calculateCompletionStats } from '@/lib/certificate'

const postSchema = z.object({
  playlistId: z.string().uuid(),
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = postSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const { playlistId } = parsed.data
    const userId = session.user.id

    // Check if certificate already exists
    const [existing] = await db
      .select()
      .from(certificates)
      .where(and(eq(certificates.userId, userId), eq(certificates.playlistId, playlistId)))
      .limit(1)

    if (existing) {
      return Response.json({ success: true, certificate: existing })
    }

    // Verify course is actually 100% complete
    const stats = await calculateCompletionStats(playlistId, userId)
    if (stats.videosCount === 0 || stats.completedCount < stats.videosCount) {
      return Response.json({ error: 'Course is not fully completed' }, { status: 400 })
    }

    const shareToken = generateShareToken()
    
    // Some random generation might collide, in a real production app we would retry
    // on unique constraint violation. For now, just insert.
    const [newCert] = await db
      .insert(certificates)
      .values({
        userId,
        playlistId,
        totalHours: stats.totalHours.toString(), // decimal mapping
        shareToken,
      })
      .returning()

    return Response.json({ success: true, certificate: newCert })
  } catch (error) {
    console.error('[POST /api/certificates]', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const playlistId = searchParams.get('playlistId')

    if (!playlistId) {
      return Response.json({ error: 'playlistId is required' }, { status: 400 })
    }

    const [cert] = await db
      .select()
      .from(certificates)
      .where(and(eq(certificates.userId, session.user.id), eq(certificates.playlistId, playlistId)))
      .limit(1)

    return Response.json({ certificate: cert || null })
  } catch (error) {
    console.error('[GET /api/certificates]', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
