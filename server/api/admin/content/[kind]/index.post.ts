/** Create an activity or page. */
export default defineEventHandler(async (event) => {
  const kind = kindFromParam(getRouterParam(event, 'kind'))
  const values = await parseAdminInput(kind, await readBody(event))
  const id = await createContent(kind, values)

  setResponseStatus(event, 201)
  return { id }
})
