/**
 * Upload a hero image for an activity or page to Netlify Blobs.
 *
 * Deliberately not tied to a record id, so the new-activity and new-page
 * screens can upload before the record exists. The form sends the returned key
 * back on save, and that is what attaches the image to a record.
 */
export default defineEventHandler(async (event) => {
  const parts = await readMultipartFormData(event)
  const file = parts?.find(part => part.name === 'file' && part.filename)

  if (!file) {
    throw createError({ statusCode: 400, statusMessage: 'Choose an image to upload.' })
  }

  const extension = extensionForContentType(file.type)
  if (!extension) {
    throw createError({ statusCode: 415, statusMessage: 'Use a JPEG, PNG, WebP, GIF or AVIF image.' })
  }

  if (file.data.byteLength > MAX_HERO_IMAGE_BYTES) {
    throw createError({ statusCode: 413, statusMessage: 'Images must be 5 MB or smaller.' })
  }

  const key = await saveHeroImage(file.data, extension)

  setResponseStatus(event, 201)
  return { key, url: heroImageUrlForKey(key) }
})
