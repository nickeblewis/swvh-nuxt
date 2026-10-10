import { z } from 'zod'

const userSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(12, 'Password must be at least 12 characters'),
})

/** Create an admin user. Replaces Devise registration, which was admin-only anyway. */
export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, userSchema.safeParse)
  if (!body.success) {
    throw createError({
      statusCode: 422,
      statusMessage: body.error.issues.map(issue => issue.message).join(', '),
    })
  }

  const db = useDb()
  const email = body.data.email.toLowerCase()
  const passwordHash = await hashPassword(body.data.password)

  try {
    const [row] = await db
      .insert(tables.adminUsers)
      .values({ email, passwordHash })
      .returning({ id: tables.adminUsers.id })

    setResponseStatus(event, 201)
    return { id: row!.id }
  }
  catch {
    // The only constraint on this table is the unique index on email.
    throw createError({ statusCode: 422, statusMessage: 'That email address is already registered.' })
  }
})
