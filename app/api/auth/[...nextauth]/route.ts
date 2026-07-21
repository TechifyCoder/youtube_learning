import { handlers } from '@/lib/auth'

// ─────────────────────────────────────────────────────────────
// NextAuth v5 Route Handler
// Handles GET and POST for all /api/auth/* routes
// ─────────────────────────────────────────────────────────────

export const { GET, POST } = handlers
