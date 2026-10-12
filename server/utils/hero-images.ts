import { getStore } from '@netlify/blobs'

/**
 * Uploaded hero images for activities and pages, stored in Netlify Blobs.
 *
 * The blob key is a random id plus the file extension, e.g. `3f2c….webp`. The
 * extension is how the serving route picks a Content-Type, so only the types
 * listed here are ever accepted or served — anything else (SVG in particular,
 * which can carry script) is rejected at upload.
 */
const CONTENT_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  avif: 'image/avif',
}

const EXTENSIONS = Object.fromEntries(
  Object.entries(CONTENT_TYPES).map(([extension, type]) => [type, extension]),
)

/** Netlify Functions cap request bodies at 6 MB; leave headroom for the multipart envelope. */
export const MAX_HERO_IMAGE_BYTES = 5 * 1024 * 1024

const KEY_PATTERN = /^[0-9a-f-]{36}\.(?:jpg|png|webp|gif|avif)$/

/** Also used by `scripts/migrate-hero-images.ts`, which opens the store from outside a function. */
export const HERO_IMAGE_STORE = 'hero-images'

function heroImageStore() {
  return getStore(HERO_IMAGE_STORE)
}

export function isHeroImageKey(key: string | null | undefined): key is string {
  return typeof key === 'string' && KEY_PATTERN.test(key)
}

/** The public URL a stored key is served from, by `server/routes/images/uploads/[key].get.ts`. */
export function heroImageUrlForKey(key: string): string {
  return `/images/uploads/${key}`
}

export function heroImageContentType(key: string): string {
  return CONTENT_TYPES[key.split('.').pop() ?? ''] ?? 'application/octet-stream'
}

export function extensionForContentType(type: string | undefined): string | undefined {
  return type ? EXTENSIONS[type] : undefined
}

export async function saveHeroImage(data: Uint8Array, extension: string): Promise<string> {
  const key = `${crypto.randomUUID()}.${extension}`
  // Copy into a fresh array: multipart parts are Node Buffers, which can be
  // views onto a larger shared pool, so `data.buffer` alone may hold other bytes.
  await heroImageStore().set(key, new Uint8Array(data).buffer)
  return key
}

export async function readHeroImage(key: string) {
  return heroImageStore().get(key, { type: 'arrayBuffer' })
}

/**
 * Remove a blob that no activity or page points at any more.
 *
 * Only in production: deploy previews get a branch of the production database,
 * so a preview's rows can reference production's blobs. Deleting there
 * would break the live site's images. Previews and local dev leave the old
 * blob behind instead, which costs a little storage and nothing else.
 */
export async function deleteHeroImage(key: string | null | undefined) {
  if (!isHeroImageKey(key)) return
  const netlify = (globalThis as { Netlify?: { context?: { deploy?: { context?: string } } } }).Netlify
  if (netlify?.context?.deploy?.context !== 'production') return
  await heroImageStore().delete(key)
}
