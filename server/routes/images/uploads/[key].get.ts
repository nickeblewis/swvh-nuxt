/** Serve an uploaded hero image out of Netlify Blobs. */
export default defineEventHandler(async (event) => {
  const key = getRouterParam(event, 'key')

  if (!isHeroImageKey(key)) {
    throw createError({ statusCode: 404, statusMessage: 'Image not found' })
  }

  const data = await readHeroImage(key)
  if (!data) {
    throw createError({ statusCode: 404, statusMessage: 'Image not found' })
  }

  setResponseHeaders(event, {
    'Content-Type': heroImageContentType(key),
    // Keys are random and never reused — a new upload gets a new key — so the
    // bytes behind a URL never change and can be cached forever.
    'Cache-Control': 'public, max-age=31536000, immutable',
    'X-Content-Type-Options': 'nosniff',
  })
  return new Uint8Array(data)
})
