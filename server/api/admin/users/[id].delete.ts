import { count, eq } from 'drizzle-orm'

/** Delete an admin user, with two guards against locking everyone out. */
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid id' })
  }

  const { user } = await requireUserSession(event)
  if (user.id === id) {
    throw createError({ statusCode: 422, statusMessage: 'You cannot delete your own account.' })
  }

  const db = useDb()
  const [total] = await db.select({ value: count() }).from(tables.adminUsers)
  if ((total?.value ?? 0) <= 1) {
    throw createError({ statusCode: 422, statusMessage: 'Cannot delete the last admin user.' })
  }

  await db.delete(tables.adminUsers).where(eq(tables.adminUsers.id, id))
  return { ok: true }
})
