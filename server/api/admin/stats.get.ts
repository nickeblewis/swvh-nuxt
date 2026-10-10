import { count } from 'drizzle-orm'

/** Counts for the admin dashboard. */
export default defineEventHandler(async () => {
  const db = useDb()

  const [activities, pages, spaces, users] = await Promise.all([
    db.select({ value: count() }).from(tables.activities),
    db.select({ value: count() }).from(tables.pages),
    db.select({ value: count() }).from(tables.spaces),
    db.select({ value: count() }).from(tables.adminUsers),
  ])

  return {
    activities: activities[0]?.value ?? 0,
    pages: pages[0]?.value ?? 0,
    spaces: spaces[0]?.value ?? 0,
    users: users[0]?.value ?? 0,
  }
})
