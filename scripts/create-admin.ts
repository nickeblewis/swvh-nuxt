/**
 * Create (or reset the password of) an admin user.
 *
 *   netlify dev:exec -- npx tsx scripts/create-admin.ts nick@example.com
 *
 * Run it through `netlify dev:exec` so NETLIFY_DB_URL is injected. If it isn't
 * (an unlinked folder), see "Creating an admin user" in the README. The
 * password is read from stdin, never from argv, so it doesn't end up in shell
 * history.
 *
 * Admin users are created here rather than seeded in a migration: committing a
 * password hash to the repository would mean shipping a known default credential.
 *
 * The hash is produced with the same driver and default parameters that
 * `nuxt-auth-utils` uses for `hashPassword`/`verifyPassword`
 * (@adonisjs/hash scrypt), so the two stay interchangeable.
 */
import { createInterface } from 'node:readline/promises'
import process from 'node:process'
import { Hash } from '@adonisjs/hash'
import { Scrypt } from '@adonisjs/hash/drivers/scrypt'
import { drizzle } from 'drizzle-orm/netlify-db'
import { sql } from 'drizzle-orm'
import * as schema from '../db/schema'

async function main() {
  const email = process.argv[2]?.trim().toLowerCase()
  if (!email) {
    console.error('Usage: npx tsx scripts/create-admin.ts <email>')
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
