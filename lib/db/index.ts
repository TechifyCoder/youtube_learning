import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'
import * as platformSchemaModule from './platformSchema'

// ─────────────────────────────────────────────────────────────
// DUAL DATABASE SETUP
//
// DATABASE 1 — PLATFORM DB (DATABASE_URL = your Neon DB)
//   → Only stores users table (WHO is using the app)
//   → Use: platformDb for user identity operations
//
// DATABASE 2 — USER'S OWN DB (stored in users.byok_database_url)
//   → All user activity: playlists, videos, progress, etc.
//   → Use: getUserDb(userId) from lib/db/getUserDb.ts
// ─────────────────────────────────────────────────────────────

if (!process.env['DATABASE_URL']) {
  throw new Error('DATABASE_URL environment variable is not set')
}

const platformSql = neon(process.env['DATABASE_URL'])

// Platform DB — for users table ONLY
export const platformDb = drizzle(platformSql, { schema: platformSchemaModule })

// Legacy `db` export — backwards compatible with existing routes
// (still points to platform DB with full schema for existing code)
export const db = drizzle(platformSql, { schema })

// Re-export schemas for convenience
export { schema }
export { platformSchemaModule as platformSchema }
// Note: Don't re-export * from platformSchema to avoid conflicts with schema.ts users table.
// Import platformSchema fields directly when needed:
//   import { users } from '@/lib/db/platformSchema'
