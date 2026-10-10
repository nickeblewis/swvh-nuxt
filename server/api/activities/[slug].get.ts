/** `/regular-activities/:slug` — one activity, plus three others for "More from the hall". */
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')!

  // One query serves both: the list is small, and the others are needed anyway.
  const activities = await loadPublishedActivities()
  const activity = activities.find(row => row.slug === slug)
  if (!activity) {
    throw createError({ statusCode: 404, statusMessage: 'Activity not found' })
  }

  return {
    activity: toActivityDetail(activity),
    // Not related by subject: simply the first three others in the usual order.
    related: activities.filter(row => row.slug !== slug).slice(0, 3).map(row => toActivityItem(row, null)),
  }
})
