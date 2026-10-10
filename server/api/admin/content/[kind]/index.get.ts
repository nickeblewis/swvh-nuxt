/** Admin list for activities or pages, including drafts. */
export default defineEventHandler(async (event) => {
  const kind = kindFromParam(getRouterParam(event, 'kind'))
  return listAllForAdmin(kind)
})
