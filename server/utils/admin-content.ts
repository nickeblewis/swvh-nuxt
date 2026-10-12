import { and, asc, eq, ne } from 'drizzle-orm'
import { z } from 'zod'

/**
 * Admin CRUD for the database-backed content: activities and pages.
 *
 * The model rules live here rather than in the database:
 *   - the slug is derived from the title when left blank, and is not changed
 *     when the title changes later
 *   - slugs are unique, and pages can't use a slug the site already routes
 *   - phone numbers are squished, blank becomes null
 */

export type AdminKind = 'activities' | 'pages'

/** Map the `[kind]` route segment onto a kind, or 404. */
export function kindFromParam(value: string | undefined): AdminKind {
  if (value === 'activities' || value === 'pages') return value
  throw createError({ statusCode: 404, statusMessage: 'Unknown content type' })
}

/** Rails' `String#parameterize`. */
export function parameterize(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Pages rendered from Vue files in `app/pages`. */
const STATIC_PAGE_SLUGS = [
  'market', 'repair-cafe', 'booking', 'contact', 'about',
  'hall-info', 'history', 'the-committee', 'terms-and-conditions',
]

/** Slugs an admin-created page can't use: the built-in pages and every other routed path. */
export const RESERVED_PAGE_SLUGS = [
  ...STATIC_PAGE_SLUGS,
  'home', 'regular-activities', 'articles', 'admin', 'admin_users', 'users', 'up', 'api',
]

/** An optional text field: trimmed, with blank stored as null. */
const optionalText = z
  .string()
  .nullish()
  .transform(value => value?.trim() || null)

const sharedFields = {
  title: z.string().trim().min(1, 'Title can\'t be blank'),
  slug: z.string().trim().optional().default(''),
  body: z.string().refine(value => value.trim().length > 0, 'Body can\'t be blank'),
  description: optionalText,
  heroImagePath: optionalText,
  /** An uploaded image's Netlify Blobs key, from `POST /api/admin/uploads/hero-image`. */
  heroImageKey: optionalText.refine(key => key === null || isHeroImageKey(key), 'Image upload is not recognised'),
  heroImageAlt: optionalText,
  sourceUrl: optionalText,
  draft: z.boolean().optional().default(false),
  position: z.number().int().optional().default(0),
}

export const activityInputSchema = z.object({
  ...sharedFields,
  day: optionalText,
  time: optionalText,
  price: optionalText,
  ageRange: optionalText,
  contact: optionalText,
  phone: z
    .string()
    .nullish()
    .transform(value => value?.replace(/\s+/g, ' ').trim() || null)
    .refine(value => value === null || /^\+?[\d\s()-]{7,20}$/.test(value), 'Phone is invalid'),
  externalUrl: optionalText,
})

export const pageInputSchema = z.object({
  ...sharedFields,
  template: z.enum(['standard', 'contact']).optional().default('standard'),
})

export type ActivityInput = z.infer<typeof activityInputSchema>
export type PageInput = z.infer<typeof pageInputSchema>

/** A row in an admin list. `summary` is the schedule for activities, the slug for pages. */
export interface AdminListRow {
  id: number
  title: string
  slug: string
  draft: boolean
  summary: string
}

/** Everything in the table, drafts included, in the order the site shows it. */
export async function listAllForAdmin(kind: AdminKind): Promise<AdminListRow[]> {
  const db = useDb()

  if (kind === 'activities') {
    const t = tables.activities
    const rows = await db
      .select({ id: t.id, title: t.title, slug: t.slug, draft: t.draft, day: t.day, time: t.time })
      .from(t)
      .orderBy(asc(t.position), asc(t.title))
    return rows.map(({ day, time, ...row }) => ({ ...row, summary: [day, time].filter(Boolean).join(' · ') }))
  }

  const t = tables.pages
  const rows = await db
    .select({ id: t.id, title: t.title, slug: t.slug, draft: t.draft })
    .from(t)
    .orderBy(asc(t.position), asc(t.title))
  return rows.map(row => ({ ...row, summary: `/${row.slug}` }))
}

/** A single record by id for the edit form, drafts included. */
export async function findForAdmin(kind: AdminKind, id: number) {
  const db = useDb()

  if (kind === 'activities') {
    const [row] = await db.select().from(tables.activities).where(eq(tables.activities.id, id)).limit(1)
    return row ?? null
  }

  const [row] = await db.select().from(tables.pages).where(eq(tables.pages.id, id)).limit(1)
  return row ?? null
}

/**
 * Validate a request body for the kind, apply the slug rules, and return the
 * columns to write. Throws a 422 with a readable message when it doesn't pass.
 * `id` is the record being updated, so it doesn't clash with its own slug.
 */
export async function parseAdminInput(kind: AdminKind, body: unknown, id?: number) {
  const parsed = kind === 'activities' ? activityInputSchema.safeParse(body) : pageInputSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: parsed.error.issues.map(issue => issue.message).join(', '),
    })
  }

  const slug = parsed.data.slug || parameterize(parsed.data.title)
  if (!slug) {
    throw createError({ statusCode: 422, statusMessage: 'Slug can\'t be blank' })
  }
  if (kind === 'pages' && RESERVED_PAGE_SLUGS.includes(slug)) {
    throw createError({ statusCode: 422, statusMessage: 'Slug is reserved for a built-in page' })
  }
  if (await slugTaken(kind, slug, id)) {
    throw createError({ statusCode: 422, statusMessage: 'Slug has already been taken' })
  }

  // A record with an uploaded image always points `heroImagePath` at it, so the
  // public pages read one field whichever way the image arrived.
  const { heroImageKey } = parsed.data
  const heroImagePath = heroImageKey ? heroImageUrlForKey(heroImageKey) : parsed.data.heroImagePath

  return { ...parsed.data, slug, heroImagePath }
}

async function slugTaken(kind: AdminKind, slug: string, id?: number): Promise<boolean> {
  const t = kind === 'activities' ? tables.activities : tables.pages
  const [row] = await useDb()
    .select({ id: t.id })
    .from(t)
    .where(id === undefined ? eq(t.slug, slug) : and(eq(t.slug, slug), ne(t.id, id)))
    .limit(1)
  return row !== undefined
}

export async function createContent(kind: AdminKind, values: ActivityInput | PageInput): Promise<number> {
  const db = useDb()

  if (kind === 'activities') {
    const [row] = await db
      .insert(tables.activities)
      .values(values as ActivityInput)
      .returning({ id: tables.activities.id })
    return row!.id
  }

  const [row] = await db.insert(tables.pages).values(values as PageInput).returning({ id: tables.pages.id })
  return row!.id
}

export async function updateContent(kind: AdminKind, id: number, values: ActivityInput | PageInput) {
  const db = useDb()
  const updatedAt = new Date()
  const t = kind === 'activities' ? tables.activities : tables.pages

  const [previous] = await db.select({ heroImageKey: t.heroImageKey }).from(t).where(eq(t.id, id)).limit(1)

  if (kind === 'activities') {
    await db
      .update(tables.activities)
      .set({ ...(values as ActivityInput), updatedAt })
      .where(eq(tables.activities.id, id))
  }
  else {
    await db.update(tables.pages).set({ ...(values as PageInput), updatedAt }).where(eq(tables.pages.id, id))
  }

  // Replaced or removed: the old upload is no longer referenced.
  if (previous?.heroImageKey && previous.heroImageKey !== values.heroImageKey) {
    await deleteHeroImage(previous.heroImageKey)
  }
}

export async function deleteContent(kind: AdminKind, id: number) {
  const t = kind === 'activities' ? tables.activities : tables.pages
  const [deleted] = await useDb().delete(t).where(eq(t.id, id)).returning({ heroImageKey: t.heroImageKey })
  await deleteHeroImage(deleted?.heroImageKey)
}
