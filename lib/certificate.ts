import { db } from '@/lib/db'
import { videos, watchProgress } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { randomBytes } from 'crypto'

export function generateShareToken(): string {
  // Generate a random 12-character alphanumeric string
  return randomBytes(9).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 12)
}

export async function calculateCompletionStats(playlistId: string, userId: string) {
  const playlistVideos = await db
    .select({
      id: videos.id,
      durationSeconds: videos.durationSeconds,
      isCompleted: videos.isCompleted,
    })
    .from(videos)
    .where(and(eq(videos.playlistId, playlistId), eq(videos.userId, userId)))

  const videoIds = playlistVideos.map(v => v.id)
  
  // Need to calculate total hours from watchProgress or videos
  // To keep it simple and accurate, we can just sum the duration of completed videos
  // or use the actual watch_progress seconds.
  // The actual watch_progress represents exactly what they watched.
  // Wait, if we use actual watch_progress, they could have skipped around.
  // But our definition of 'total hours' for the certificate could just be the course duration they completed.
  const totalDurationSeconds = playlistVideos
    .filter(v => v.isCompleted)
    .reduce((acc, v) => acc + v.durationSeconds, 0)
    
  const totalHours = Number((totalDurationSeconds / 3600).toFixed(2))
  
  return {
    totalHours,
    videosCount: playlistVideos.length,
    completedCount: playlistVideos.filter(v => v.isCompleted).length
  }
}

export async function checkAndGenerateCertificate(playlistId: string, userId: string) {
  const { certificates } = await import('@/lib/db/schema')
  
  // Check if certificate already exists
  const [existing] = await db
    .select()
    .from(certificates)
    .where(and(eq(certificates.userId, userId), eq(certificates.playlistId, playlistId)))
    .limit(1)

  if (existing) return existing

  // Verify course is actually 100% complete
  const stats = await calculateCompletionStats(playlistId, userId)
  if (stats.videosCount === 0 || stats.completedCount < stats.videosCount) {
    return null
  }

  const shareToken = generateShareToken()
  
  const [newCert] = await db
    .insert(certificates)
    .values({
      userId,
      playlistId,
      totalHours: stats.totalHours.toString(),
      shareToken,
    })
    .returning()

  return newCert
}
