import { and, eq, isNull, lte, or } from 'drizzle-orm'
import type { PageDetail, PageTemplate } from '#shared/types/content'

/** A published admin-created page by slug, or null. Same publishing rule as activities. */
export async function findPublishedPage(slug: string): Promise<PageDetail | null> {
  const t = tables.pages
  const [row] = await useDb()
    .select()
    .from(t)
    .where(and(
      eq(t.slug, slug),
      eq(t.draft, false),
      or(isNull(t.publishedAt), lte(t.publishedAt, new Date())),
    ))
    .limit(1)

  if (!row) return null

  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    body: row.body,
    template: row.template === 'contact' ? 'contact' : ('standard' satisfies PageTemplate),
    heroImagePath: row.heroImagePath,
    heroImageAlt: row.heroImageAlt,
  }
}
