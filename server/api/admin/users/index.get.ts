/** Admin users, without their password hashes. */
export default defineEventHandler(async () => {
  const db = useDb()

  return db
    .select({
      id: tables.adminUsers.id,
      email: tables.adminUsers.email,
      createdAt: tables.adminUsers.createdAt,
    })
    .from(tables.adminUsers)
    .orderBy(tables.adminUsers.email)
})
