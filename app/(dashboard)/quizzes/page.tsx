import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { quizAttempts, videos, playlists } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { BrainCircuit } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { QuizzesListClient } from './QuizzesListClient'

export const metadata = { title: 'Quizzes' }

export default async function QuizzesPage() {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) return redirect('/login')

  const attempts = await db
    .select({
      id: quizAttempts.id,
      quizType: quizAttempts.quizType,
      score: quizAttempts.score,
      maxScore: quizAttempts.maxScore,
      isComplete: quizAttempts.isComplete,
      startedAt: quizAttempts.startedAt,
      completedAt: quizAttempts.completedAt,
      answers: quizAttempts.answers,
      videoTitle: videos.title,
      playlistTitle: playlists.title,
    })
    .from(quizAttempts)
    .leftJoin(videos, eq(quizAttempts.videoId, videos.id))
    .leftJoin(playlists, eq(quizAttempts.playlistId, playlists.id))
    .where(eq(quizAttempts.userId, userId))
    .orderBy(desc(quizAttempts.startedAt))

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      <div>
        <h1 className="font-heading font-bold text-display text-[--text-primary] mb-1">
          Quizzes & Practice
        </h1>
        <p className="text-body text-[--text-secondary]">
          Review your past quiz attempts and practice question feedback.
        </p>
      </div>

      {attempts.length > 0 ? (
        <QuizzesListClient attempts={attempts as any[]} />
      ) : (
        <EmptyState
          icon={<BrainCircuit className="w-7 h-7" />}
          title="No quizzes taken yet"
          description="Take a quiz after completing a video to test your knowledge and practice your skills."
          action={{
            label: 'Go to Dashboard',
            href:  '/dashboard',
          }}
          className="mt-12"
        />
      )}
    </div>
  )
}
