/** Update an activity or page. */
export default defineEventHandler(async (event) => {
  const kind = kindFromParam(getRouterParam(event, 'kind'))
  const id = Number(getRouterParam(event, 'id'))

  if (!Number.isInteger(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid id' })
  }

  const existing = await findForAdmin(kind, id)
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  const values = await parseAdminInput(kind, await readBody(event), id)
  await updateContent(kind, id, values)
  return { ok: true }
})
