import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { users, certificates, playlists } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { ProfileForm } from './ProfileForm'
import Link from 'next/link'

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const [dbUser] = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1)

  const earnedCerts = await db
    .select({
      cert: certificates,
      playlist: playlists
    })
    .from(certificates)
    .innerJoin(playlists, eq(certificates.playlistId, playlists.id))
    .where(eq(certificates.userId, session.user.id))

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold text-white">Your Profile</h1>
        <p className="text-[--text-secondary] mt-1">Manage your public presence and showcase your achievements.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-[--bg-secondary] border border-white/5 p-6 rounded-xl">
            <ProfileForm 
              initialUsername={dbUser?.username || ''} 
              initialBio={dbUser?.bio || ''} 
              initialIsPublic={dbUser?.isPublic || false} 
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[--bg-secondary] border border-white/5 p-6 rounded-xl flex flex-col items-center text-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-600 to-blue-600 p-1">
              <div className="w-full h-full rounded-full overflow-hidden bg-[--bg-primary]">
                {dbUser?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={dbUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white">
                    {dbUser?.name?.[0] || 'U'}
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-white">{dbUser?.name}</h2>
              <p className="text-[--text-secondary] text-sm">{dbUser?.email}</p>
            </div>

            {dbUser?.isPublic && dbUser?.username && (
              <a 
                href={`/u/${dbUser.username}`} 
                target="_blank" 
                rel="noreferrer"
                className="text-purple-400 hover:text-purple-300 text-sm font-medium"
              >
                View public profile &rarr;
              </a>
            )}
          </div>
          
          <div className="bg-[--bg-secondary] border border-white/5 p-6 rounded-xl">
            <h3 className="font-heading font-semibold text-white mb-4">Earned Certificates</h3>
            {earnedCerts.length === 0 ? (
              <p className="text-sm text-[--text-secondary]">You haven&apos;t earned any certificates yet. Keep learning!</p>
            ) : (
              <div className="space-y-3">
                {earnedCerts.map(({ cert, playlist }) => (
                  <Link 
                    key={cert.id} 
                    href={`/certificate/${cert.id}`}
                    className="block p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/5"
                  >
                    <div className="font-medium text-white text-sm truncate">{playlist.title}</div>
                    <div className="text-xs text-[--text-secondary] mt-1">
                      {cert.totalHours} hrs • {new Date(cert.issuedAt).toLocaleDateString()}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
