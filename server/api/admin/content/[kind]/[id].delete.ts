/** Delete an activity or page. */
export default defineEventHandler(async (event) => {
  const kind = kindFromParam(getRouterParam(event, 'kind'))
  const id = Number(getRouterParam(event, 'id'))

  if (!Number.isInteger(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid id' })
  }

  await deleteContent(kind, id)
  return { ok: true }
})
