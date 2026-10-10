import { eq } from 'drizzle-orm'
import { z } from 'zod'

const updateSchema = z.object({
  password: z.string().min(12, 'Password must be at least 12 characters'),
})

/**
 * Reset an admin user's password.
 *
 * This stands in for Devise's recoverable flow, which isn't ported: there is no
 * emailed reset link, an existing admin sets the password directly.
 */
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid id' })
  }

  const body = await readValidatedBody(event, updateSchema.safeParse)
  if (!body.success) {
    throw createError({
      statusCode: 422,
      statusMessage: body.error.issues.map(issue => issue.message).join(', '),
    })
  }

  const db = useDb()
  const passwordHash = await hashPassword(body.data.password)

  const updated = await db
    .update(tables.adminUsers)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(tables.adminUsers.id, id))
    .returning({ id: tables.adminUsers.id })

  if (updated.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Admin user not found' })
  }

  return { ok: true }
})
