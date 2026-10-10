import { queryCollection } from '@nuxt/content/server'
import type { H3Event } from 'h3'
import type { ArticleDetail, ArticleItem } from '#shared/types/content'

/**
 * Articles are markdown files in `content/articles/`, read through Nuxt
 * Content. There is no table for them; the slug is the filename.
 */

/** Shape of a row as stored by Nuxt Content, with our frontmatter fields. */
interface ArticleRow {
  stem?: string
  path?: string
  title?: string
  description?: string
  published_at?: string
  draft?: boolean
  hero_image?: string
  hero_image_alt?: string
  rawbody?: string
}

function toItem(row: ArticleRow): ArticleItem | null {
  const slug = row.stem?.split('/').pop() || row.path?.split('/').filter(Boolean).pop()
  if (!slug) return null

  const publishedAt = toIsoOrNull(row.published_at)
  if (!isPublished({ draft: row.draft, publishedAt })) return null

  return {
    slug,
    title: row.title ?? slug,
    description: row.description ?? '',
    publishedAt,
    readingTimeMinutes: readingTimeMinutes(row.rawbody),
    heroImageUrl: row.hero_image ?? null,
    heroImageAlt: row.hero_image_alt ?? null,
  }
}

/** Published articles, newest first. */
export async function loadArticles(event: H3Event): Promise<ArticleItem[]> {
  // Imported explicitly rather than auto-imported: the app and server builds
  // both expose a `queryCollection`, and only the server one takes an event.
  const rows: ArticleRow[] = await queryCollection(event, 'articles').all()
  return rows.map(toItem).filter(item => item !== null).sort(publishedAtDescending)
}

/** One published article with its parsed document, or null. */
export async function findArticle(event: H3Event, slug: string): Promise<ArticleDetail | null> {
  const row = await queryCollection(event, 'articles').where('stem', '=', `articles/${slug}`).first()
  if (!row) return null

  const item = toItem(row)
  if (!item) return null

  // `rawbody` is only needed for the reading time; don't send it to the browser.
  const { rawbody: _rawbody, ...doc } = row
  return { ...item, doc }
}
