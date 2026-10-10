/** `/articles/:slug` — one article. Drafts and unknown slugs are a 404. */
export default defineEventHandler(async (event) => {
  const article = await findArticle(event, getRouterParam(event, 'slug')!)
  if (!article) {
    throw createError({ statusCode: 404, statusMessage: 'Article not found' })
  }

  return article
})
