import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

// ─────────────────────────────────────────────────────────────
// Middleware — Route Protection + Onboarding Gate
//
// Rules:
// 1. Unauthenticated → /login (except public paths)
// 2. Authenticated + onboarding NOT complete → /onboarding
//    (except /onboarding/*, /api/onboarding/*, /api/keys/*, /api/auth/*)
// 3. Authenticated + onboarding COMPLETE + visiting /onboarding → /dashboard
// 4. Authenticated + visiting /login → /dashboard
// ─────────────────────────────────────────────────────────────

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // ── Public paths — no auth needed ─────────────────────────
  const publicPaths = ['/login', '/api/auth', '/u', '/cert', '/pricing']
  const isPublic = publicPaths.some((p) => pathname.startsWith(p)) || pathname === '/'

  // ── API paths allowed during onboarding ───────────────────
  // These are needed before onboarding completes
  const onboardingAllowedPaths = [
    '/onboarding',
    '/api/onboarding',
    '/api/keys',
    '/api/auth',
  ]
  const isOnboardingAllowed = onboardingAllowedPaths.some((p) => pathname.startsWith(p))

  // ── Not authenticated ──────────────────────────────────────
  if (!session && !isPublic) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ── Authenticated ──────────────────────────────────────────
  if (session?.user?.id) {
    // Redirect away from /login
    if (pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // The session user has `onboardingComplete` added via the auth callback.
    // In Free Mode, we skip onboarding completely and redirect to dashboard.

    if (pathname.startsWith('/onboarding')) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files (og-image, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|og-image.png).*)',
  ],
}
