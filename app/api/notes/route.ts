import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { notes } from '@/lib/db/schema'
import { eq, and, asc } from 'drizzle-orm'
import { z } from 'zod'

const noteSchema = z.object({
  videoId: z.string().uuid(),
  content: z.string().min(1).max(2000),
  timestampSeconds: z.number().int().min(0),
})

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const videoId = searchParams.get('videoId')

    if (!videoId) {
      return Response.json({ error: 'Missing videoId' }, { status: 400 })
    }

    const userNotes = await db
      .select()
      .from(notes)
      .where(and(eq(notes.userId, session.user.id), eq(notes.videoId, videoId)))
      .orderBy(asc(notes.timestampSeconds))

    return Response.json(userNotes)
  } catch (error) {
    console.error('[GET /api/notes]', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = noteSchema.safeParse(body)
    
    if (!parsed.success) {
      return Response.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
    }

    const { videoId, content, timestampSeconds } = parsed.data

    const [newNote] = await db.insert(notes).values({
      userId: session.user.id,
      videoId,
      content,
      timestampSeconds,
    }).returning()

    return Response.json(newNote)
  } catch (error) {
    console.error('[POST /api/notes]', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const noteId = searchParams.get('noteId')

    if (!noteId) {
      return Response.json({ error: 'Missing noteId' }, { status: 400 })
    }

    await db.delete(notes).where(and(eq(notes.id, noteId), eq(notes.userId, session.user.id)))

    return Response.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/notes]', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
