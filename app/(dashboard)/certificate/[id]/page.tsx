import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { certificates, users, playlists, videos } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { CertificateClient } from './CertificateClient'
import { differenceInDays } from 'date-fns'

export default async function CertificatePage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  // Fetch certificate + user + playlist
  const [certData] = await db
    .select({
      cert: certificates,
      user: users,
      playlist: playlists,
    })
    .from(certificates)
    .innerJoin(users, eq(certificates.userId, users.id))
    .innerJoin(playlists, eq(certificates.playlistId, playlists.id))
    .where(and(eq(certificates.id, params.id), eq(certificates.userId, session.user.id)))
    .limit(1)

  if (!certData) {
    notFound()
  }

  // Get count of videos
  const [videoCount] = await db
    .select({ count: videos.id })
    .from(videos)
    .where(eq(videos.playlistId, certData.playlist.id))

  const count = await db.select({ id: videos.id }).from(videos).where(eq(videos.playlistId, certData.playlist.id))

  // Calculate days taken
  const daysTaken = Math.max(1, differenceInDays(
    new Date(certData.cert.issuedAt), 
    new Date(certData.playlist.createdAt)
  ))

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-white mb-2">Your Certificate</h1>
        <p className="text-[--text-secondary]">
          Congratulations on completing {certData.playlist.title}!
        </p>
      </div>

      <CertificateClient 
        userName={certData.user.name || 'Anonymous Learner'}
        courseTitle={certData.playlist.title}
        totalHours={Number(certData.cert.totalHours)}
        videosCount={count.length}
        daysTaken={daysTaken}
        issueDate={certData.cert.issuedAt}
        shareToken={certData.cert.shareToken}
      />
    </div>
  )
}
