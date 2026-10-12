/**
 * Create (or reset the password of) an admin user.
 *
 *   netlify dev                                          # terminal 1, leave running
 *   npx tsx scripts/create-admin.ts nick@example.com     # terminal 2
 *
 * The local database only runs while `netlify dev` is running (`netlify
 * dev:exec` does not start it). If NETLIFY_DB_URL isn't set, the script picks
 * up the connection string `netlify dev` records in .netlify/state.json. Pass
 * NETLIFY_DB_URL inline to target another database, such as production; see
 * "Creating an admin user" in the README. The password is read from stdin,
 * never from argv, so it doesn't end up in shell history.
 *
 * Admin users are created here rather than seeded in a migration: committing a
 * password hash to the repository would mean shipping a known default credential.
 *
 * The hash is produced with the same driver and default parameters that
 * `nuxt-auth-utils` uses for `hashPassword`/`verifyPassword`
 * (@adonisjs/hash scrypt), so the two stay interchangeable.
 */
import { readFileSync } from 'node:fs'
import { createInterface } from 'node:readline/promises'
import process from 'node:process'
import { Hash } from '@adonisjs/hash'
import { Scrypt } from '@adonisjs/hash/drivers/scrypt'
import { drizzle } from 'drizzle-orm/netlify-db'
import { sql } from 'drizzle-orm'
import * as schema from '../db/schema'

// `netlify dev` writes the local database's connection string to
// .netlify/state.json while it is running and removes it on exit.
function useLocalDevDatabase() {
  if (process.env.NETLIFY_DB_URL) return true
  try {
    const state = JSON.parse(readFileSync(new URL('../.netlify/state.json', import.meta.url), 'utf8'))
    if (typeof state.dbConnectionString !== 'string') return false
    process.env.NETLIFY_DB_URL = state.dbConnectionString
    return true
  } catch {
    return false
  }
}

async function main() {
  const email = process.argv[2]?.trim().toLowerCase()
  if (!email) {
    console.error('Usage: npx tsx scripts/create-admin.ts <email>')
    process.exitCode = 1
    return
  }

  if (!useLocalDevDatabase()) {
    console.error('No database found. Start `netlify dev` in another terminal, then re-run this script.')
    process.exitCode = 1
    return
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const password = (await rl.question(`Password for ${email}: `)).trim()
  rl.close()

  if (password.length < 12) {
    console.error('Password must be at least 12 characters.')
    process.exitCode = 1
    return
  }

  const hash = new Hash(new Scrypt({}))
  const passwordHash = await hash.make(password)

  // Always node-postgres, for local and hosted databases alike. Without this the
  // adapter falls back to Neon's HTTP client, which drizzle-orm 1.0.0-rc.4 calls
  // in a way @neondatabase/serverless 1.x rejects — see server/utils/db.ts.
  process.env.NETLIFY_DB_DRIVER = 'server'
  const db = drizzle({ schema })
  await db
    .insert(schema.adminUsers)
    .values({ email, passwordHash })
    .onConflictDoUpdate({
      target: schema.adminUsers.email,
      set: { passwordHash, updatedAt: sql`now()` },
    })

  console.log(`Admin user ${email} is ready.`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
