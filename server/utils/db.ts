import { getConnectionString } from '@netlify/database'
import { Pool, neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/netlify-db'
import * as schema from '~~/db/schema'

/**
 * Drizzle over Netlify Database.
 *
 * The `netlify-db` adapter picks the underlying Postgres driver for the runtime:
 * node-postgres in server mode (`netlify dev`), Neon's HTTP client when deployed.
 * It requires Netlify Functions v2 — see the `compatibilityDate` note in
 * nuxt.config.ts.
 *
 * Constructed lazily and memoised so a cold start pays for it once, and so
 * importing this module never touches the platform at build time.
 *
 * No `schema` option: Drizzle 1.0 dropped it in favour of the separate
 * `defineRelations` API, which this app doesn't use — all queries are explicit
 * joins, and table references come from `tables` below.
 */
function createDb() {
  // Server mode is the adapter's own node-postgres path and needs no help.
  // Read off globalThis because the server tsconfig has no Node types.
  const { process } = globalThis as { process?: { env: Record<string, string | undefined> } }
  if (process?.env.NETLIFY_DB_DRIVER === 'server') return drizzle()

  // Deployed. drizzle-orm 1.0.0-rc.4 calls the Neon HTTP client as a plain
  // function, `client(sql, params, options)`, which @neondatabase/serverless 1.x
  // rejects ("can now be called only as a tagged-template function"); every
  // query 500s. Hand the adapter a client that forwards that call to `.query()`.
  // Delete this branch, and go back to a bare `drizzle()`, once the adapter is fixed.
  const connectionString = getConnectionString()
  const sql = neon(connectionString)
  const query: typeof sql.query = (text, params, options) => sql.query(text, params, options)
  const transaction: typeof sql.transaction = (queries, options) => sql.transaction(queries, options)
  const http = Object.assign(query, { query, transaction }) as unknown as typeof sql

  return drizzle({ client: { http, pool: new Pool({ connectionString }) } })
}

let _db: ReturnType<typeof createDb> | undefined

export function useDb() {
  _db ??= createDb()
  return _db
}

/** Convenience re-export so handlers can use `tables.activities` without a second import. */
export const tables = schema
