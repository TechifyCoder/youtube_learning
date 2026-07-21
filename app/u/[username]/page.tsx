import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { users, certificates, playlists, activityLog } from '@/lib/db/schema'
import { eq, desc, and, gte } from 'drizzle-orm'
import Link from 'next/link'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
  const [user] = await db.select().from(users).where(eq(users.username, params.username)).limit(1)
  
  if (!user || !user.isPublic) return { title: 'Profile Not Found' }

  return {
    title: `${user.name} (@${user.username}) - LearnLoop`,
    description: user.bio || `Check out ${user.name}'s learning journey on LearnLoop.`,
  }
}

export default async function PublicProfilePage({ params }: { params: { username: string } }) {
  const [user] = await db.select().from(users).where(eq(users.username, params.username)).limit(1)

  if (!user) {
    notFound()
  }

  if (!user.isPublic) {
    return (
      <div className="min-h-screen bg-[--bg-primary] flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="text-4xl">🔒</div>
          <h1 className="text-2xl font-bold text-white">This profile is private</h1>
          <p className="text-[--text-secondary]">The user has chosen to keep their learning journey private.</p>
          <a href="/" className="text-purple-400 hover:text-purple-300 block pt-4">Return home &rarr;</a>
        </div>
      </div>
    )
  }

  // Fetch certificates
  const userCerts = await db
    .select({
      cert: certificates,
      playlist: playlists
    })
    .from(certificates)
    .innerJoin(playlists, eq(certificates.playlistId, playlists.id))
    .where(eq(certificates.userId, user.id))
    .orderBy(desc(certificates.issuedAt))

  // Fetch recent activity for a simple heat map or stats
  // Let's just fetch basic stats for now: total hours from certs
  const totalHours = userCerts.reduce((acc, c) => acc + Number(c.cert.totalHours), 0)
  const coursesCompleted = userCerts.length

  return (
    <div className="min-h-screen bg-[--bg-primary] p-4 py-12 md:py-24">
      {/* Ambient bg */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-purple-600/[0.08] blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto space-y-12">
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-purple-600 to-blue-600 p-1">
            <div className="w-full h-full rounded-full overflow-hidden bg-[--bg-primary]">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white">
                  {user.name?.[0] || 'U'}
                </div>
              )}
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-heading font-bold text-white">{user.name}</h1>
            <p className="text-purple-400 font-medium">@{user.username}</p>
          </div>
          {user.bio && (
            <p className="max-w-md text-[--text-secondary]">{user.bio}</p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[--bg-secondary] border border-white/5 rounded-xl p-6 text-center">
            <div className="text-3xl font-heading font-bold text-white mb-1">{coursesCompleted}</div>
            <div className="text-sm text-[--text-secondary]">Courses Finished</div>
          </div>
          <div className="bg-[--bg-secondary] border border-white/5 rounded-xl p-6 text-center">
            <div className="text-3xl font-heading font-bold text-white mb-1">{totalHours}</div>
            <div className="text-sm text-[--text-secondary]">Hours Learned</div>
          </div>
          <div className="bg-[--bg-secondary] border border-white/5 rounded-xl p-6 text-center">
            <div className="text-3xl font-heading font-bold text-white mb-1">{user.streakCount}</div>
            <div className="text-sm text-[--text-secondary]">Current Streak</div>
          </div>
          <div className="bg-[--bg-secondary] border border-white/5 rounded-xl p-6 text-center">
            <div className="text-3xl font-heading font-bold text-white mb-1">{user.longestStreak}</div>
            <div className="text-sm text-[--text-secondary]">Longest Streak</div>
          </div>
        </div>

        {/* Certificates Grid */}
        <div>
          <h2 className="text-2xl font-heading font-bold text-white mb-6">Earned Certificates</h2>
          {userCerts.length === 0 ? (
            <div className="bg-[--bg-secondary] border border-white/5 rounded-xl p-12 text-center text-[--text-secondary]">
              This user hasn&apos;t earned any certificates yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userCerts.map(({ cert, playlist }) => (
                <Link 
                  key={cert.id} 
                  href={`/cert/${cert.shareToken}`}
                  className="group block bg-[--bg-secondary] border border-white/5 rounded-xl overflow-hidden hover:border-purple-500/50 transition-colors"
                >
                  <div className="aspect-[1.414] bg-[#0A0812] relative flex items-center justify-center border-b border-white/5">
                    {/* Placeholder for visual cert representation */}
                    <div className="text-center px-4">
                      <div className="text-xs text-purple-400 font-bold mb-2 uppercase tracking-wider">LearnLoop</div>
                      <div className="font-serif text-white font-medium text-sm md:text-base line-clamp-3">
                        {playlist.title}
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="text-sm text-[--text-secondary]">
                      Issued {new Date(cert.issuedAt).toLocaleDateString()}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center pt-12 border-t border-white/5">
          <a href="/" className="inline-flex items-center gap-2 text-sm text-[--text-secondary] hover:text-white transition-colors">
            <div className="w-5 h-5 rounded bg-purple-600 flex items-center justify-center text-white font-bold text-[10px]">
              L
            </div>
            Learning with LearnLoop
          </a>
        </div>
      </div>
    </div>
  )
}
