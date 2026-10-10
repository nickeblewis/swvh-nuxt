import { sql } from 'drizzle-orm'
import {
  boolean,
  check,
  date,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

/**
 * The data model, a table-for-table translation of the Rails `db/schema.rb`.
 *
 * Deliberate differences from Rails:
 *   - Active Storage is not ported. Hero images are a `hero_image_path` into
 *     `public/images` plus alt text; there are no uploads yet.
 *   - Devise's reset/remember columns are omitted, and `encrypted_password`
 *     becomes `password_hash` (scrypt, from `nuxt-auth-utils`).
 *   - The Solid Queue/Cache/Cable tables have no equivalent here.
 *
 * `bookings`, `booking_spaces`, `payments` and `users` are carried over so the
 * model matches Rails, but nothing reads or writes them yet: the booking
 * system has no UI on either side.
 */

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}

/**
 * A regular activity at the hall. `day` and `time` are free text ("Monday,
 * Thursday", "1st Sunday of month", "7:30 PM - 9:00 PM"); the next session is
 * worked out from them in `server/utils/schedule.ts`.
 */
export const activities = pgTable('activities', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull(),
  body: text('body').notNull(),
  description: text('description'),
  day: text('day'),
  time: text('time'),
  price: text('price'),
  ageRange: text('age_range'),
  contact: text('contact'),
  phone: text('phone'),
  externalUrl: text('external_url'),
  heroImagePath: text('hero_image_path'),
  heroImageAlt: text('hero_image_alt'),
  sourceUrl: text('source_url'),
  sourceUpdatedOn: date('source_updated_on', { mode: 'string' }),
  draft: boolean('draft').notNull().default(false),
  position: integer('position').notNull().default(0),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  ...timestamps,
}, table => [
  uniqueIndex('activities_slug_key').on(table.slug),
  index('activities_draft_position_idx').on(table.draft, table.position),
])

/**
 * Admin-created pages, served at `/:slug` by the catch-all route. The built-in
 * pages (market, booking, …) are Vue files, and their slugs are reserved — see
 * `RESERVED_PAGE_SLUGS` in `server/utils/admin-content.ts`.
 */
export const pages = pgTable('pages', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull(),
  body: text('body').notNull(),
  template: text('template').notNull().default('standard'),
  description: text('description'),
  heroImagePath: text('hero_image_path'),
  heroImageAlt: text('hero_image_alt'),
  sourceUrl: text('source_url'),
  draft: boolean('draft').notNull().default(false),
  position: integer('position').notNull().default(0),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  ...timestamps,
}, table => [
  uniqueIndex('pages_slug_key').on(table.slug),
  index('pages_draft_position_idx').on(table.draft, table.position),
])

/** The parts of the hall that can be hired. Shown as chips on the home page. */
export const spaces = pgTable('spaces', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  bookable: boolean('bookable').notNull().default(true),
  position: integer('position').notNull().default(0),
  capacity: integer('capacity'),
  description: text('description'),
  dimensions: text('dimensions'),
  ...timestamps,
}, table => [
  uniqueIndex('spaces_slug_key').on(table.slug),
  index('spaces_bookable_position_idx').on(table.bookable, table.position),
])

/** Hirers. Separate from `admin_users`; no sign-in is wired up for them yet. */
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().default(''),
  passwordHash: text('password_hash').notNull().default(''),
  name: text('name').notNull(),
  phone: text('phone'),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  ...timestamps,
}, table => [
  uniqueIndex('users_email_key').on(table.email),
  index('users_approved_at_idx').on(table.approvedAt),
])

export const BOOKING_STATUSES = ['requested', 'confirmed', 'declined', 'cancelled'] as const
export type BookingStatus = typeof BOOKING_STATUSES[number]

export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
  endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
  status: text('status').$type<BookingStatus>().notNull().default('requested'),
  notes: text('notes'),
  userId: integer('user_id').notNull().references(() => users.id),
  ...timestamps,
}, table => [
  index('bookings_starts_at_ends_at_idx').on(table.startsAt, table.endsAt),
  index('bookings_status_idx').on(table.status),
  index('bookings_user_id_idx').on(table.userId),
  check('bookings_ends_after_starts', sql`${table.endsAt} > ${table.startsAt}`),
])

export const bookingSpaces = pgTable('booking_spaces', {
  id: serial('id').primaryKey(),
  bookingId: integer('booking_id').notNull().references(() => bookings.id),
  spaceId: integer('space_id').notNull().references(() => spaces.id),
  ...timestamps,
}, table => [
  uniqueIndex('booking_spaces_booking_id_space_id_key').on(table.bookingId, table.spaceId),
  index('booking_spaces_booking_id_idx').on(table.bookingId),
  index('booking_spaces_space_id_idx').on(table.spaceId),
])

export const PAYMENT_STATUSES = ['pending', 'paid', 'refunded', 'failed'] as const
export type PaymentStatus = typeof PAYMENT_STATUSES[number]

/** Money is integer pence plus an ISO currency code. Never floats. */
export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  amountPence: integer('amount_pence').notNull(),
  bookingId: integer('booking_id').notNull().references(() => bookings.id),
  currency: text('currency').notNull().default('GBP'),
  status: text('status').$type<PaymentStatus>().notNull().default('pending'),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  provider: text('provider'),
  providerReference: text('provider_reference'),
  ...timestamps,
}, table => [
  uniqueIndex('payments_booking_id_key').on(table.bookingId),
])

/** Who can sign in to `/admin`. Created with `scripts/create-admin.ts`, never seeded. */
export const adminUsers = pgTable('admin_users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  passwordHash: text('password_hash').notNull(),
  ...timestamps,
}, table => [
  uniqueIndex('admin_users_email_key').on(table.email),
])

// No `relations()` / `defineRelations()` block: queries use explicit joins,
// which avoids coupling to the relational API while it settles for 1.0.

export type Activity = typeof activities.$inferSelect
export type Page = typeof pages.$inferSelect
export type Space = typeof spaces.$inferSelect
export type User = typeof users.$inferSelect
export type Booking = typeof bookings.$inferSelect
export type BookingSpace = typeof bookingSpaces.$inferSelect
export type Payment = typeof payments.$inferSelect
export type AdminUser = typeof adminUsers.$inferSelect
