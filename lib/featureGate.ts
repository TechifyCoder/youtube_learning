import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getUserKeys } from './userKeys'
import { isEarlyAccessUser } from './earlyAccess'


export async function canUseFeature(
  userId: string,
  feature: 'ai_quiz' | 'transcript_qa' | 'certificate' | 'public_profile'
): Promise<{ allowed: boolean; reason?: string }> {
  
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  
  if (!user) {
    return { allowed: false, reason: 'User not found' }
  }

  // ─── Early Access: first 10 users get ALL features free ────────
  const earlyAccess = await isEarlyAccessUser(userId)
  if (earlyAccess) {
    return { allowed: true }
  }

  // BYOK mode — check if relevant key exists
  if (user.mode === 'byok') {
    const keys = await getUserKeys(userId)
    
    if (feature === 'ai_quiz' || feature === 'transcript_qa') {
      if (!keys.geminiApiKey && user.plan !== 'coupon_learn26') {
        return {
          allowed: false,
          reason: 'Add your Gemini API key in Settings or redeem a coupon to use this feature'
        }
      }
    }
    // BYOK allows all features if keys are present
    return { allowed: true }
  }

  // Subscription mode — check plan
  if (user.mode === 'subscription') {
    // Basic plan check
    if (user.plan === 'free' || (user.planExpiresAt && user.planExpiresAt < new Date())) {
      return {
        allowed: false,
        reason: 'Upgrade to Pro to use this feature'
      }
    }

    if (user.plan === 'basic' && ['ai_quiz', 'certificate'].includes(feature)) {
      return {
        allowed: false,
        reason: 'This feature requires the Pro plan'
      }
    }
    
    return { allowed: true }
  }

  return { allowed: false, reason: 'Unknown mode' }
}
