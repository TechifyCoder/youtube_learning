import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { playlists, videos as videosTable } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

// ─────────────────────────────────────────────────────────────
// GET /api/playlists/[id]
// Fetches a single playlist and all its videos.
// ─────────────────────────────────────────────────────────────

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch the playlist ensuring it belongs to the current user
    const [playlist] = await db
      .select()
      .from(playlists)
      .where(and(eq(playlists.id, params.id), eq(playlists.userId, session.user.id)))
      .limit(1)

    if (!playlist) {
      return Response.json({ error: 'Playlist not found' }, { status: 404 })
    }

    // Fetch all videos for this playlist, ordered by index
    const playlistVideos = await db
      .select()
      .from(videosTable)
      .where(eq(videosTable.playlistId, playlist.id))
      .orderBy(videosTable.orderIndex)

    return Response.json({
      playlist,
      videos: playlistVideos,
    })
  } catch (error) {
    console.error('[GET /api/playlists/[id]]', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ─────────────────────────────────────────────────────────────
// DELETE /api/playlists/[id]
// Deletes a playlist and cascades deletion to videos & progress.
// ─────────────────────────────────────────────────────────────

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ensure it belongs to the user before deleting
    const deleted = await db
      .delete(playlists)
      .where(and(eq(playlists.id, params.id), eq(playlists.userId, session.user.id)))
      .returning()

    if (deleted.length === 0) {
      return Response.json({ error: 'Playlist not found or unauthorized' }, { status: 404 })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/playlists/[id]]', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
