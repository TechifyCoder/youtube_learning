import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ─────────────────────────────────────────────────────────────
// Middleware — Protect Dashboard Routes
// All /(dashboard)/* routes require an active session.
// If not authenticated → redirect to /login.
// ─────────────────────────────────────────────────────────────

export default auth((req: NextRequest & { auth: Awaited<ReturnType<typeof auth>> }) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Public routes that don't need auth
  const publicPaths = ['/login', '/api/auth']
  const isPublic = publicPaths.some((p) => pathname.startsWith(p))

  if (!session && !isPublic) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If logged in and visiting /login → redirect to dashboard
  if (session && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
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
