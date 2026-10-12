# Spencers Wood Village Hall (Nuxt)

The website for Spencers Wood Village Hall: regular activities, the market and
repair cafe, hall information and hire. A Nuxt port of the Rails app
(`swvh_rails`), built on the same stack as `headforcode_nuxt`.

## How the content works

| Content | Where it lives | How it is changed |
| --- | --- | --- |
| Regular activities | `activities` table | `/admin/activities` |
| Ad hoc pages (served at `/:slug`) | `pages` table | `/admin/pages` |
| Built-in pages: home, market, repair cafe, booking, contact, about, hall info, history, the committee, terms | Vue files in `app/pages/` | In the code |
| Articles | Markdown in `content/articles/` | In the repository |
| Spaces (home page chips) | `spaces` table | By migration |
| Site identity: name, email, address, charity number | `runtimeConfig.public.site` in `nuxt.config.ts` | In the code; read it with `useSite()`, never hard-code it |
| Images | `public/images/` | In the repository |

An admin-created page can't use a slug the site already routes; the list is
`RESERVED_PAGE_SLUGS` in `server/utils/admin-content.ts`. A page with the
`contact` template gets the enquiry form under its body.

### Activity schedules

An activity's `day` and `time` are free text, and the next session is worked out
from them (`server/utils/schedule.ts`, tested in `tests/schedule.test.ts`):

- `day`: one or more weekdays (`Monday, Thursday`, `Saturdays`), or a monthly
  rule (`1st Sunday of month`, `Last Friday of month`).
- `time`: `7:30 PM - 9:00 PM`. With no end time a session lasts an hour.
- Anything else still shows, without a date, after the scheduled activities.

All of it is calculated in `Europe/London`, on the server, per request. The
"Today · 7:30 PM" labels are sent ready-made so the server render and the
browser agree.

### Articles

One markdown file per article in `content/articles/`; the filename is the slug.

```md
---
title: Summer fete
description: One or two sentences for the card and search engines.
published_at: 2026-07-01   # optional; a future date hides it until then
draft: false               # optional
hero_image: /images/articles/summer-fete.jpg   # optional
hero_image_alt: Stalls on the hall lawn         # optional
---
```

### Repair cafe photos

Every image in `public/images/repair-cafe/` appears on `/repair-cafe`, in
filename order. Alt text comes from the filename
(`03-sewing-repairs.jpg` → "Sewing repairs"). The folder is read at build time,
so adding a photo needs a deploy.

## Stack

- **Nuxt 4** on the Nitro `netlify` preset, server-rendered.
- **Netlify Database** (`@netlify/database`) with **Drizzle** on the `rc`
  channel. Keep `drizzle-orm` and `drizzle-kit` on matching versions;
  `server/utils/db.ts` carries a workaround tied to them.
- **Nuxt Content v3** for articles, and **`@nuxtjs/mdc`** so database bodies
  render through the same markdown pipeline.
- **Tailwind CSS v4** with `@tailwindcss/typography`. Stock palette: stone,
  teal and amber. Dark mode is a `.dark` class on `<html>`, toggled by the Theme
  button and remembered in `localStorage` (`swvh-theme`).
- **`nuxt-auth-utils`** (sealed-cookie sessions, scrypt) for the admin.
- **Netlify Forms** for the contact form. The form is registered from the static
  skeleton in `public/__forms.html`; keep its field names in step with
  `app/components/ContactForm.vue`. Who gets notified is set in the Netlify UI
  (Forms > Submission notifications).

## Local development

Requires Node 22+ and Netlify CLI 26+.

```bash
npm install
cp .env.example .env               # then set NUXT_SESSION_PASSWORD (32+ characters)
netlify dev                        # starts the local Postgres and the Nuxt dev server
netlify database migrations apply  # apply pending migrations locally (not automatic)
```

`netlify dev` is the entry point rather than `npm run dev`: it provisions the
local database. Running `npm run dev` on its own gives you a site with no
database behind it, and every page that lists activities will fail.

### Creating an admin user

Admin users are never seeded. Create one (or reset a password) with the script;
it asks for the password, which must be at least 12 characters.

**In development**, the local database only runs while `netlify dev` is
running, so use two terminals:

```bash
netlify dev                                # terminal 1, leave running
npm run admin:create you@example.com       # terminal 2
```

The script picks up the local connection string that `netlify dev` records in
`.netlify/state.json`. If it reports `No database found`, `netlify dev` isn't
running.

**In production**, pass the hosted database's connection string inline, for
that one command only:

```bash
netlify database status --show-credentials   # copy the production connection string
NETLIFY_DB_URL='<connection string>' npm run admin:create you@example.com
```

Production sign-in also needs `NUXT_SESSION_PASSWORD` set on Netlify; see
[Deploying](#deploying).

Then sign in at `/admin/login`. Further admins can be added at `/admin/users`.
There is no emailed password reset.

## Changing the schema

```bash
npm run db:generate    # writes a migration to netlify/database/migrations/
```

The contract, and it matters:

- `drizzle-kit generate` **writes** migration files. The **deploy applies them**.
- Never run `drizzle-kit push`, and never run `drizzle-kit migrate` against
  `NETLIFY_DB_URL`.
- Never edit or delete a migration that has already been applied — that's
  checksum drift, and the next deploy will reject it. Write a corrective
  migration instead.
- Locally, and only locally, apply with `netlify database migrations apply`.

The seed migration inserts the 19 activities and 5 spaces once and skips any
slug that already exists, so it never overwrites edits made in `/admin`.

## Deploying

The folder is linked to the Netlify site `swvh-nuxt`. Deploy preview-first so a
failure never leaves production half-configured:

```bash
netlify deploy          # provisions the DB, applies migrations, gives a draft URL
# verify the draft URL
netlify deploy --prod
```

The admin can't sign in until the session secret is set on Netlify. Set it
once, with a different value from the one in your local `.env`, then redeploy
so the functions pick it up:

```bash
netlify env:set NUXT_SESSION_PASSWORD "$(openssl rand -hex 32)" --context production
```

Environment variables:

| Name | Purpose |
| --- | --- |
| `NUXT_SESSION_PASSWORD` | Encrypts the admin session cookie. Required, 32+ characters. |
| `NETLIFY_DB_URL` | Injected by Netlify and by `netlify dev`. Never set it in Netlify's environment variables or in `.env`; pass it inline only to point `admin:create` at production. |

## Differences from the Rails app

- **Seeding.** Rails re-imported `content/activities/*.md` on every boot,
  overwriting admin edits. Here the activities are seeded once by migration and
  the database is the source of truth.
- **Images.** No uploads yet. Activities and pages take a path under
  `public/images`; Active Storage is not ported.
- **Contact form.** Netlify Forms, not Resend.
- **Admin.** Signs in at `/admin/login`. No emailed password reset; an admin
  sets passwords at `/admin/users` or with the script. The lists have a Delete
  button, which the Rails lists did not.
- **Bookings.** The `bookings`, `booking_spaces`, `payments` and `users` tables
  exist to match the Rails model, but nothing uses them yet. `/booking` still
  embeds the Hall Master diary.
- **Code highlighting.** Shiki at render time, not Prism in the browser.
- **Small fixes.** Form inputs have visible borders, short pages fill the width
  on phones, the theme is applied before first paint, pages have meta
  descriptions, and unknown URLs get a site-styled 404.

## Commands

| Command | What it does |
| --- | --- |
| `netlify dev` | Run the site with its local database |
| `npm test` | Unit tests (the schedule logic) |
| `npm run typecheck` | Type-check the app and server |
| `npm run build` | Production build |
| `npm run db:generate` | Write a migration from `db/schema.ts` |
| `netlify database migrations apply` | Apply migrations to the local database |
| `netlify database status` | Show applied and pending migrations |
