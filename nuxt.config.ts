import { readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'

/**
 * The photos in a folder under public/images, e.g. gallery('repair-cafe').
 * Drop files in to add them; they're shown in filename order, and alt text
 * comes from the filename ("03-sewing-repairs.jpg" => "Sewing repairs").
 *
 * Listed here, at build time, because the deployed server function can't read
 * the public directory.
 */
function gallery(folder: string): { path: string, alt: string }[] {
  const directory = fileURLToPath(new URL(`./public/images/${folder}`, import.meta.url))

  return readdirSync(directory)
    .filter(file => /\.(?:jpe?g|png|webp|gif)$/i.test(file))
    .sort()
    .map((file) => {
      const words = file
        .replace(/\.[^.]+$/, '')
        .replace(/^\d+[-_ ]*/, '')
        .replace(/[-_]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase()
      return { path: `/images/${folder}/${file}`, alt: words.charAt(0).toUpperCase() + words.slice(1) }
    })
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Must be >= 2024-05-07 so Nitro emits Netlify Functions v2 rather than Lambda
  // compatibility mode. @netlify/database cannot resolve a connection in Lambda mode.
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxt/content', '@nuxtjs/mdc', 'nuxt-auth-utils', '@netlify/nuxt'],

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  runtimeConfig: {
    public: {
      // Site identity. Never hard-code these in components; read them through
      // `useSite()`. No secrets here.
      site: {
        name: 'Spencers Wood Village Hall',
        shortName: 'SWVH',
        tagline: 'At the heart of the community',
        locality: 'Spencers Wood, Reading',
        charityNumber: '300204',
        // Contact enquiries go through Netlify Forms; who gets notified is set
        // in the Netlify UI (Forms > Submission notifications), not here.
        email: 'admin@swvh.org.uk',
        address: ['Basingstoke Road', 'Spencers Wood', 'Reading', 'Berkshire', 'RG7 1AP'],
        mapQuery: 'Basingstoke Road, Spencers Wood, Reading, Berkshire RG7 1AP',
        hallmasterDiaryId: 7878,
        timeZone: 'Europe/London',
      },
      galleries: {
        repairCafe: gallery('repair-cafe'),
      },
    },
  },

  content: {
    experimental: {
      // Use Node's built-in `node:sqlite` (Node 22+) rather than the native
      // better-sqlite3 build. Avoids a compile step, and avoids a peer
      // dependency clash with drizzle's `waddler`, which pins better-sqlite3 ^11
      // while Nuxt Content pulls ^13.
      sqliteConnector: 'native',
    },
    build: {
      markdown: {
        highlight: {
          // Shiki highlights code blocks at build/render time.
          theme: {
            default: 'github-light',
            dark: 'github-dark',
          },
          langs: ['yaml', 'bash', 'json', 'ts', 'js', 'html', 'css'],
        },
      },
    },
  },

  mdc: {
    highlight: {
      theme: {
        default: 'github-light',
        dark: 'github-dark',
      },
      langs: ['yaml', 'bash', 'json', 'ts', 'js', 'html', 'css'],
    },
  },
})
