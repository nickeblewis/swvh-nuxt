/** `/` — the next six sessions across the hall, and the spaces that can be hired. */
export default defineEventHandler(async () => {
  const now = new Date()
  const [activities, spaces] = await Promise.all([loadPublishedActivities(), loadBookableSpaces()])

  return {
    today: todayLabel(now),
    upcoming: upcoming(activities, 6, now).map(({ activity, session }) => toActivityItem(activity, session, now)),
    spaces,
  }
})
