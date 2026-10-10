/**
 * The next session of one activity, for the built-in pages that show it as a
 * badge (`/market` and `/repair-cafe`). Null when the activity is missing,
 * unpublished or has no parseable schedule: the page just shows no badge.
 */
export default defineEventHandler(async (event) => {
  const now = new Date()
  const activity = await findPublishedActivity(getRouterParam(event, 'slug')!)

  return { occurrence: activity ? toOccurrence(nextOccurrence(activity, now), now) : null }
})
