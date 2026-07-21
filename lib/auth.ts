import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// ─────────────────────────────────────────────────────────────
// NextAuth v5 Configuration
// Google OAuth provider — credentials login not supported
// ─────────────────────────────────────────────────────────────

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId:     process.env['GOOGLE_CLIENT_ID']!,
      clientSecret: process.env['GOOGLE_CLIENT_SECRET']!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== 'google') return false
      if (!user.email) return false

      try {
        // Upsert user record in DB on every login
        const existingUsers = await db
          .select()
          .from(users)
          .where(eq(users.email, user.email))
          .limit(1)

        if (existingUsers.length === 0) {
          await db.insert(users).values({
            email:     user.email,
            name:      user.name ?? null,
            avatarUrl: user.image ?? null,
          })
        } else {
          // Update name/avatar in case they changed in Google
          await db
            .update(users)
            .set({
              name:      user.name ?? null,
              avatarUrl: user.image ?? null,
            })
            .where(eq(users.email, user.email))
        }
      } catch (error) {
        console.error('[Auth] Failed to upsert user:', error)
        return false
      }

      return true
    },

    async session({ session, token }) {
      // Attach our internal DB user ID to the session
      if (session.user?.email) {
        try {
          const [dbUser] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.email, session.user.email))
            .limit(1)

          if (dbUser) {
            session.user.id = dbUser.id
          }
        } catch (error) {
          console.error('[Auth] Failed to fetch user ID for session:', error)
        }
      }
      return session
    },

    async jwt({ token, user }) {
      if (user?.email) {
        token['email'] = user.email
      }
      return token
    },
  },
  pages: {
    signIn: '/login',
    error:  '/login',
  },
  session: {
    strategy: 'jwt',
  },
})

// ─────────────────────────────────────────────────────────────
// Type augmentation — add `id` to the session user
// ─────────────────────────────────────────────────────────────
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}
