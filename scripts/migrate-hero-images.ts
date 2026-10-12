/**
 * One-off: move the hero images that were seeded as files under `public/images`
 * into the Netlify Blobs store the admin uploads to.
 *
 *   npx tsx scripts/migrate-hero-images.ts            # dry run, lists what would move
 *   npx tsx scripts/migrate-hero-images.ts --apply    # upload and repoint the rows
 *
 * For every activity and page with a `hero_image_path` under `/images/` and no
 * `hero_image_key`, the file is uploaded under a new key and the row is pointed
 * at it. Rows that already have a key are skipped, so a run that fails part way
 * can simply be run again.
 *
 * The database is found the same way as in `scripts/create-admin.ts`. `--apply`
 * is for a hosted database only, so it needs NETLIFY_DB_URL passed inline, plus
 * NETLIFY_AUTH_TOKEN (a Netlify personal access token) to reach the blob store
 * from outside a function. Local dev serves blobs from its own sandbox, which
 * this script can't write to, so a local database is left on the `public/` files.
 *
 * Deploy the upload feature first: until `/images/uploads/[key]` is live, a
 * repointed row has nothing to serve its image.
 */
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import process from 'node:process'
import { getStore } from '@netlify/blobs'
import { drizzle } from 'drizzle-orm/netlify-db'
import { and, eq, isNull, like } from 'drizzle-orm'
import * as schema from '../db/schema'
import { HERO_IMAGE_STORE, heroImageUrlForKey, isHeroImageKey } from '../server/utils/hero-images'

const apply = process.argv.includes('--apply')

function readState(): { dbConnectionString?: unknown, siteId?: unknown } {
  try {
    return JSON.parse(readFileSync(new URL('../.netlify/state.json', import.meta.url), 'utf8'))
  } catch {
    return {}
  }
}

/** The blob key's extension for a file, or undefined when it isn't a type the site serves. */
function extensionFor(path: string): string | undefined {
  const extension = path.split('.').pop()?.toLowerCase()
  const normalised = extension === 'jpeg' ? 'jpg' : extension
  return isHeroImageKey(`${'0'.repeat(36)}.${normalised}`) ? normalised : undefined
}

async function main() {
  const state = readState()
  const explicitDatabase = Boolean(process.env.NETLIFY_DB_URL)

  if (!explicitDatabase) {
    if (apply) {
      console.error('--apply needs NETLIFY_DB_URL set to the hosted database. See the comment at the top of this script.')
      process.exitCode = 1
      return
    }
    if (typeof state.dbConnectionString !== 'string') {
      console.error('No database found. Start `netlify dev` in another terminal, or pass NETLIFY_DB_URL.')
      process.exitCode = 1
      return
    }
    process.env.NETLIFY_DB_URL = state.dbConnectionString
  }

  const siteID = process.env.NETLIFY_SITE_ID ?? (typeof state.siteId === 'string' ? state.siteId : undefined)
  const token = process.env.NETLIFY_AUTH_TOKEN
  if (apply && (!siteID || !token)) {
    console.error('--apply needs NETLIFY_AUTH_TOKEN, and a linked folder or NETLIFY_SITE_ID.')
    process.exitCode = 1
    return
  }

  console.log(`Database host: ${new URL(process.env.NETLIFY_DB_URL!).hostname}`)
  console.log(`Netlify site:  ${siteID ?? '(not linked)'}`)
  console.log(apply ? 'Applying.\n' : 'Dry run. Pass --apply to upload and update.\n')

  // Always node-postgres — see scripts/create-admin.ts.
  process.env.NETLIFY_DB_DRIVER = 'server'
  const db = drizzle({ schema })
  const store = apply ? getStore({ name: HERO_IMAGE_STORE, siteID, token }) : null

  let moved = 0
  let skipped = 0

  for (const [label, t] of [['activity', schema.activities], ['page', schema.pages]] as const) {
    const rows = await db
      .select({ id: t.id, slug: t.slug, heroImagePath: t.heroImagePath })
      .from(t)
      .where(and(isNull(t.heroImageKey), like(t.heroImagePath, '/images/%')))
      .orderBy(t.id)

    for (const row of rows) {
      const path = row.heroImagePath!
      const file = fileURLToPath(new URL(`../public${path}`, import.meta.url))
      const extension = extensionFor(path)

      if (path.includes('..') || !extension || !existsSync(file)) {
        console.log(`skip  ${label} ${row.slug}: ${extension ? 'no file at' : 'unsupported type'} ${path}`)
        skipped++
        continue
      }

      if (!store) {
        console.log(`would move  ${label} ${row.slug}: ${path}`)
        moved++
        continue
      }

      const data = readFileSync(file)
      const key = `${crypto.randomUUID()}.${extension}`
      await store.set(key, new Uint8Array(data).buffer)

      // Read it back before repointing the row, so a row never points at a blob that didn't land.
      const stored = await store.get(key, { type: 'arrayBuffer', consistency: 'strong' })
      if (stored?.byteLength !== data.byteLength) {
        throw new Error(`Upload of ${path} could not be verified; ${label} ${row.slug} was left unchanged.`)
      }

      await db
        .update(t)
        .set({ heroImageKey: key, heroImagePath: heroImageUrlForKey(key), updatedAt: new Date() })
        .where(eq(t.id, row.id))

      console.log(`moved  ${label} ${row.slug}: ${path} -> ${heroImageUrlForKey(key)}`)
      moved++
    }
  }

  console.log(`\n${apply ? 'Moved' : 'Would move'} ${moved}, skipped ${skipped}.`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
