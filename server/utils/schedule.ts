import { TZDate } from '@date-fns/tz'
import type { Occurrence } from '#shared/types/content'

/**
 * Works out when an activity next happens from its free-text `day` and `time`
 * fields, e.g. day "Monday, Thursday" / "1st Sunday of month" / "Last Friday of
 * month" and time "7:30 PM - 9:00 PM". Anything it can't parse has no next
 * occurrence rather than throwing.
 *
 * All the calendar maths is done in the hall's time zone, whatever zone the
 * server runs in (Netlify functions run in UTC).
 *
 * Kept free of Nitro auto-imports so it can be unit tested on its own.
 */

export const HALL_TIME_ZONE = 'Europe/London'

const MONTHLY_RULE = /^(1st|2nd|3rd|4th|last)\s+(\w+)\s+of\s+(?:the\s+)?month$/i
const LOOKAHEAD_DAYS = 62
const HOUR = 60 * 60 * 1000

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const SHORT_DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export interface Schedulable {
  day: string | null
  time: string | null
}

export interface ScheduledSession {
  startsAt: Date
  endsAt: Date
}

/** A calendar date with no time or zone. `month` is 0-based, as in `Date`. */
interface CalendarDate {
  year: number
  month: number
  day: number
}

/** The calendar date `days` after `date`, with its weekday (0 = Sunday). */
function addDays(date: CalendarDate, days: number): CalendarDate & { weekday: number } {
  const shifted = new Date(Date.UTC(date.year, date.month, date.day + days))
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth(),
    day: shifted.getUTCDate(),
    weekday: shifted.getUTCDay(),
  }
}

function hallDate(at: Date, timeZone: string): CalendarDate {
  const local = new TZDate(at.getTime(), timeZone)
  return { year: local.getFullYear(), month: local.getMonth(), day: local.getDate() }
}

function sameDate(a: CalendarDate, b: CalendarDate): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day
}

/** "Tuesday" or "Tuesdays" => 2 */
function weekdayIndex(name: string): number {
  const wanted = name.trim().toLowerCase()
  return DAY_NAMES.findIndex((dayName) => {
    const lower = dayName.toLowerCase()
    return lower === wanted || `${lower}s` === wanted
  })
}

function ruleMatches(rule: string, date: CalendarDate & { weekday: number }): boolean {
  const monthly = rule.match(MONTHLY_RULE)
  if (!monthly) return weekdayIndex(rule) === date.weekday

  if (weekdayIndex(monthly[2]!) !== date.weekday) return false
  if (monthly[1]!.toLowerCase() === 'last') return addDays(date, 7).month !== date.month
  return Math.floor((date.day - 1) / 7) + 1 === Number.parseInt(monthly[1]!, 10)
}

function occursOn(day: string | null, date: CalendarDate & { weekday: number }): boolean {
  return (day ?? '')
    .split(/,|&|\band\b/i)
    .map(rule => rule.trim())
    .some(rule => ruleMatches(rule, date))
}

/** "7:30 PM - 9:00 PM" => [[19, 30], [21, 0]] */
function scheduleTimes(time: string | null): [number, number][] {
  return [...(time ?? '').matchAll(/(\d{1,2})(?::(\d{2}))?\s*([ap])\.?m\.?/gi)].map((match) => {
    let hour = Number.parseInt(match[1]!, 10) % 12
    if (match[3]!.toLowerCase() === 'p') hour += 12
    return [hour, match[2] ? Number.parseInt(match[2], 10) : 0]
  })
}

/**
 * The next session at or after `from`, including one that has started but not
 * finished. With no end time a session lasts an hour; an end at or before the
 * start means it finishes the following day.
 */
export function nextOccurrence(
  activity: Schedulable,
  from: Date = new Date(),
  timeZone: string = HALL_TIME_ZONE,
): ScheduledSession | null {
  const [start, end] = scheduleTimes(activity.time)
  if (!start) return null

  const today = hallDate(from, timeZone)

  for (let offset = 0; offset <= LOOKAHEAD_DAYS; offset++) {
    const date = addDays(today, offset)
    if (!occursOn(activity.day, date)) continue

    const startsAt = new TZDate(date.year, date.month, date.day, start[0], start[1], timeZone)
    let endsAt = end
      ? new TZDate(date.year, date.month, date.day, end[0], end[1], timeZone)
      : new TZDate(startsAt.getTime() + HOUR, timeZone)
    if (end && endsAt.getTime() <= startsAt.getTime()) {
      endsAt = new TZDate(date.year, date.month, date.day + 1, end[0], end[1], timeZone)
    }

    if (endsAt.getTime() > from.getTime()) {
      return { startsAt: new Date(startsAt.getTime()), endsAt: new Date(endsAt.getTime()) }
    }
  }

  return null
}

/**
 * Every activity paired with its next session, soonest first. Activities whose
 * schedule can't be parsed follow, in the order given, with a null session.
 */
export function byNextOccurrence<T extends Schedulable>(
  activities: T[],
  from: Date = new Date(),
  timeZone: string = HALL_TIME_ZONE,
): { activity: T, session: ScheduledSession | null }[] {
  const pairs = activities.map(activity => ({ activity, session: nextOccurrence(activity, from, timeZone) }))
  const scheduled = pairs.filter(pair => pair.session)
  const unscheduled = pairs.filter(pair => !pair.session)

  // Array#sort is stable, so sessions starting together keep the order given.
  scheduled.sort((a, b) => a.session!.startsAt.getTime() - b.session!.startsAt.getTime())
  return [...scheduled, ...unscheduled]
}

/** The next sessions across the activities given, soonest first. */
export function upcoming<T extends Schedulable>(
  activities: T[],
  limit = 6,
  from: Date = new Date(),
  timeZone: string = HALL_TIME_ZONE,
): { activity: T, session: ScheduledSession }[] {
  return byNextOccurrence(activities, from, timeZone)
    .filter((pair): pair is { activity: T, session: ScheduledSession } => pair.session !== null)
    .slice(0, limit)
}

/** "7:30 PM" */
function clockLabel(at: TZDate): string {
  const hour = at.getHours() % 12 || 12
  const minute = String(at.getMinutes()).padStart(2, '0')
  return `${hour}:${minute} ${at.getHours() < 12 ? 'AM' : 'PM'}`
}

/** "On now", "Today · 7:30 PM", "Tomorrow · 10:00 AM" or "Sun 4 Oct · 10:00 AM" */
export function occurrenceLabel(
  session: ScheduledSession,
  now: Date = new Date(),
  timeZone: string = HALL_TIME_ZONE,
): string {
  if (session.startsAt.getTime() <= now.getTime() && now.getTime() < session.endsAt.getTime()) return 'On now'

  const startsAt = new TZDate(session.startsAt.getTime(), timeZone)
  const startDate = hallDate(session.startsAt, timeZone)
  const today = hallDate(now, timeZone)

  let day: string
  if (sameDate(startDate, today)) day = 'Today'
  else if (sameDate(startDate, addDays(today, 1))) day = 'Tomorrow'
  else day = `${SHORT_DAY_NAMES[startsAt.getDay()]} ${startsAt.getDate()} ${MONTH_NAMES[startsAt.getMonth()]!.slice(0, 3)}`

  return `${day} · ${clockLabel(startsAt)}`
}

/** A session as sent to the browser, with its label already worked out. */
export function toOccurrence(
  session: ScheduledSession | null,
  now: Date = new Date(),
  timeZone: string = HALL_TIME_ZONE,
): Occurrence | null {
  if (!session) return null

  const happeningNow = session.startsAt.getTime() <= now.getTime() && now.getTime() < session.endsAt.getTime()
  const today = sameDate(hallDate(session.startsAt, timeZone), hallDate(now, timeZone))

  return {
    startsAt: session.startsAt.toISOString(),
    endsAt: session.endsAt.toISOString(),
    label: occurrenceLabel(session, now, timeZone),
    highlight: happeningNow || today,
  }
}

/** "Thursday 24 September", for the "Today is …" lines. */
export function todayLabel(now: Date = new Date(), timeZone: string = HALL_TIME_ZONE): string {
  const local = new TZDate(now.getTime(), timeZone)
  return `${DAY_NAMES[local.getDay()]} ${local.getDate()} ${MONTH_NAMES[local.getMonth()]}`
}
