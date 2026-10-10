/**
 * The publishing rules, in one place, applied identically to database records
 * and markdown files.
 */

/** `max(ceil(words / 200), 1)`, counted from the raw markdown. */
export function readingTimeMinutes(body: string | null | undefined): number {
  const words = (body ?? '').match(/\S+/g)?.length ?? 0
  return Math.max(Math.ceil(words / 200), 1)
}

/**
 * Published means not a draft, and either undated or dated in the past.
 *
 * A missing `publishedAt` counts as published, which is why drafts have to be
 * flagged explicitly. The SQL form of this rule is in `server/utils/activities.ts`
 * and `server/utils/pages.ts`.
 */
export function isPublished(
  item: { draft?: boolean | null, publishedAt?: Date | string | null },
  now: Date = new Date(),
): boolean {
  if (item.draft) return false
  if (!item.publishedAt) return true

  const publishedAt = item.publishedAt instanceof Date ? item.publishedAt : new Date(item.publishedAt)
  if (Number.isNaN(publishedAt.getTime())) return true

  return publishedAt <= now
}

/** Normalise the mixed date-only / full-ISO frontmatter values to an ISO string. */
export function toIsoOrNull(value: Date | string | null | undefined): string | null {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

/** Newest first, undated last. */
export function publishedAtDescending(a: { publishedAt: string | null }, b: { publishedAt: string | null }): number {
  const left = a.publishedAt ? Date.parse(a.publishedAt) : 0
  const right = b.publishedAt ? Date.parse(b.publishedAt) : 0
  return right - left
}
