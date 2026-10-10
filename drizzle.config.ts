import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'postgresql',
  schema: './db/schema.ts',
  // MUST be the Netlify migrations directory. Netlify discovers and applies
  // migrations from here during a deploy; anywhere else and they are ignored.
  out: 'netlify/database/migrations',
})
