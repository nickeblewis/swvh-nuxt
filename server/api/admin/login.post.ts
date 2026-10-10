import { eq } from 'drizzle-orm'
import { z } from 'zod'

/** The Devise sessions#create equivalent. */
const credentialsSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, credentialsSchema.safeParse)

  // One message for every failure mode, so the response can't be used to
  // enumerate which addresses have accounts.
  const invalid = () => createError({ statusCode: 401, statusMessage: 'Invalid email or password.' })

  if (!body.success) throw invalid()

  const { email, password } = body.data
  const db = useDb()

  const [user] = await db
    .select({
      id: tables.adminUsers.id,
      email: tables.adminUsers.email,
      passwordHash: tables.adminUsers.passwordHash,
    })
    .from(tables.adminUsers)
    .where(eq(tables.adminUsers.email, email.toLowerCase()))
    .limit(1)

  if (!user) throw invalid()
  if (!(await verifyPassword(user.passwordHash, password))) throw invalid()

  await setUserSession(event, {
    user: { id: user.id, email: user.email },
    loggedInAt: new Date().toISOString(),
  })

  return { ok: true }
})
