import { and, asc, eq, isNull, lte, or } from 'drizzle-orm'
import type { Activity } from '~~/db/schema'
import type { ActivityDetail, ActivityItem, SpaceItem } from '#shared/types/content'
import type { ScheduledSession } from './schedule'

/**
 * Queries for regular activities and the spaces shown beside them.
 *
 *   published -> draft = false AND (published_at IS NULL OR published_at <= now)
 *   ordered   -> position ASC, title ASC
 */

function published() {
  const t = tables.activities
  return and(eq(t.draft, false), or(isNull(t.publishedAt), lte(t.publishedAt, new Date())))
}

/** Every published activity, in its usual order. There are few enough to load whole. */
export async function loadPublishedActivities(): Promise<Activity[]> {
  const t = tables.activities
  return useDb().select().from(t).where(published()).orderBy(asc(t.position), asc(t.title))
}

export async function findPublishedActivity(slug: string): Promise<Activity | null> {
  const t = tables.activities
  const [row] = await useDb().select().from(t).where(and(eq(t.slug, slug), published())).limit(1)
  return row ?? null
}

export function toActivityItem(row: Activity, session: ScheduledSession | null, now: Date = new Date()): ActivityItem {
  return {
    slug: row.slug,
    title: row.title,
    day: row.day,
    time: row.time,
    price: row.price,
    heroImagePath: row.heroImagePath,
    heroImageAlt: row.heroImageAlt,
    occurrence: toOccurrence(session, now),
  }
}

export function toActivityDetail(row: Activity, now: Date = new Date()): ActivityDetail {
  return {
    ...toActivityItem(row, nextOccurrence(row, now), now),
    body: row.body,
    description: row.description,
    ageRange: row.ageRange,
    contact: row.contact,
    phone: row.phone,
    externalUrl: row.externalUrl,
  }
}

/** The spaces that can be hired, for the home page chips. */
export async function loadBookableSpaces(): Promise<SpaceItem[]> {
  const t = tables.spaces
  return useDb()
    .select({
      slug: t.slug,
      name: t.name,
      capacity: t.capacity,
      dimensions: t.dimensions,
      description: t.description,
    })
    .from(t)
    .where(eq(t.bookable, true))
    .orderBy(asc(t.position), asc(t.name))
}
