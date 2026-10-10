/** Load a single activity or page for the edit form, drafts included. */
export default defineEventHandler(async (event) => {
  const kind = kindFromParam(getRouterParam(event, 'kind'))
  const id = Number(getRouterParam(event, 'id'))

  if (!Number.isInteger(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid id' })
  }

  const record = await findForAdmin(kind, id)
  if (!record) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  return record
})
