/** `/regular-activities` — every published activity, soonest session first. */
export default defineEventHandler(async () => {
  const now = new Date()
  const activities = await loadPublishedActivities()

  return {
    today: todayLabel(now),
    activities: byNextOccurrence(activities, now).map(({ activity, session }) => toActivityItem(activity, session, now)),
  }
})
