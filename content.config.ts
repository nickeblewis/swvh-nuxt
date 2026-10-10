import { defineCollection, defineContentConfig, z } from '@nuxt/content'

/**
 * Articles: markdown files in `content/articles/`, one per article, with the
 * filename as the slug. Activities and pages are not here; they live in the
 * database and are edited in `/admin`.
 */
const frontmatter = z.object({
  // Required. A file missing either of these is a broken file.
  title: z.string(),
  description: z.string(),

  // Optional.
  // Kept as a string so both date-only ("2026-10-08") and full ISO
  // ("2026-04-13T12:57:00Z") forms are accepted. Normalised server-side.
  published_at: z.string().optional(),
  draft: z.boolean().default(false),
  hero_image: z.string().optional(),
  hero_image_alt: z.string().optional(),

  // Not frontmatter. Declaring `rawbody` in the schema makes Nuxt Content store
  // the original markdown source alongside the parsed AST, which is what reading
  // time is calculated from. Read server-side only; never sent to the client.
  rawbody: z.string().optional(),
})

export default defineContentConfig({
  collections: {
    articles: defineCollection({
      type: 'page',
      source: 'articles/*.md',
      schema: frontmatter,
    }),
  },
})
