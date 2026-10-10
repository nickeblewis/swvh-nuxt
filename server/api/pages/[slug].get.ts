/** `/:slug` — an admin-created page. Drafts and unknown slugs are a 404. */
export default defineEventHandler(async (event) => {
  const page = await findPublishedPage(getRouterParam(event, 'slug')!)
  if (!page) {
    throw createError({ statusCode: 404, statusMessage: 'Page not found' })
  }

  return page
})
