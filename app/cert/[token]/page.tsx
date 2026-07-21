import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { certificates, users, playlists, videos } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { differenceInDays } from 'date-fns'
import { CertificateCanvas } from '@/components/certificate/CertificateCanvas'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { token: string } }): Promise<Metadata> {
  const [certData] = await db
    .select({
      cert: certificates,
      user: users,
      playlist: playlists,
    })
    .from(certificates)
    .innerJoin(users, eq(certificates.userId, users.id))
    .innerJoin(playlists, eq(certificates.playlistId, playlists.id))
    .where(eq(certificates.shareToken, params.token))
    .limit(1)

  if (!certData) return { title: 'Certificate Not Found' }

  return {
    title: `${certData.user.name}'s Certificate - ${certData.playlist.title}`,
    description: `Verified completion of ${certData.playlist.title} on LearnLoop.`,
  }
}

export default async function PublicCertificatePage({ params }: { params: { token: string } }) {
  const [certData] = await db
    .select({
      cert: certificates,
      user: users,
      playlist: playlists,
    })
    .from(certificates)
    .innerJoin(users, eq(certificates.userId, users.id))
    .innerJoin(playlists, eq(certificates.playlistId, playlists.id))
    .where(eq(certificates.shareToken, params.token))
    .limit(1)

  if (!certData) {
    notFound()
  }

  // Get count of videos
  const count = await db.select({ id: videos.id }).from(videos).where(eq(videos.playlistId, certData.playlist.id))

  const daysTaken = Math.max(1, differenceInDays(
    new Date(certData.cert.issuedAt), 
    new Date(certData.playlist.createdAt)
  ))

  return (
    <div className="min-h-screen bg-[--bg-primary] flex flex-col items-center justify-center p-4">
      {/* Ambient orb background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-purple-600/[0.1] blur-[120px]" />
      </div>

      <div className="w-full max-w-4xl mx-auto space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-heading font-bold text-white">Verified Certificate</h1>
          <p className="text-[--text-secondary]">
            Issued by <span className="text-purple-400 font-medium">LearnLoop</span>
          </p>
        </div>

        <div className="w-full">
          <CertificateCanvas 
            userName={certData.user.name || 'Anonymous Learner'}
            courseTitle={certData.playlist.title}
            totalHours={Number(certData.cert.totalHours)}
            videosCount={count.length}
            daysTaken={daysTaken}
            issueDate={certData.cert.issuedAt}
            shareToken={certData.cert.shareToken}
          />
        </div>

        <div>
          <a href="/" className="text-sm text-[--text-secondary] hover:text-white transition-colors">
            Start your learning journey on LearnLoop &rarr;
          </a>
        </div>
      </div>
    </div>
  )
}
