import { TZDate } from '@date-fns/tz'
import { describe, expect, it } from 'vitest'
import {
  byNextOccurrence,
  nextOccurrence,
  occurrenceLabel,
  todayLabel,
  toOccurrence,
  upcoming,
} from '../server/utils/schedule'

/** A moment given as wall-clock time at the hall. Months are 1-based here. */
function london(year: number, month: number, day: number, hour = 0, minute = 0): Date {
  return new Date(new TZDate(year, month - 1, day, hour, minute, 'Europe/London').getTime())
}

// Thursday 24 September 2026, 12:00 London time (BST).
const now = london(2026, 9, 24, 12, 0)

function activity(day: string, time = '7:00 PM - 9:00 PM', title = `Club ${day}`) {
  return { title, day, time }
}

describe('nextOccurrence', () => {
  it('finds the next matching weekday', () => {
    const session = nextOccurrence(activity('Tuesday'), now)!

    expect(session.startsAt).toEqual(london(2026, 9, 29, 19, 0))
    expect(session.endsAt).toEqual(london(2026, 9, 29, 21, 0))
  })

  it('includes later today', () => {
    expect(nextOccurrence(activity('Thursday'), now)!.startsAt).toEqual(london(2026, 9, 24, 19, 0))
  })

  it('includes a session that is happening now', () => {
    const session = nextOccurrence(activity('Thursday', '11:00 AM - 1:00 PM'), now)!

    expect(session.startsAt).toEqual(london(2026, 9, 24, 11, 0))
    expect(occurrenceLabel(session, now)).toBe('On now')
  })

  it('moves to next week once today\'s session has finished', () => {
    const session = nextOccurrence(activity('Thursday', '9:00 AM - 10:00 AM'), now)!

    expect(session.startsAt).toEqual(london(2026, 10, 1, 9, 0))
  })

  it('handles several days', () => {
    expect(nextOccurrence(activity('Monday, Thursday'), now)!.startsAt).toEqual(london(2026, 9, 24, 19, 0))
    expect(nextOccurrence(activity('Monday & Tuesday'), now)!.startsAt).toEqual(london(2026, 9, 28, 19, 0))
    expect(nextOccurrence(activity('Saturday and Sunday'), now)!.startsAt).toEqual(london(2026, 9, 26, 19, 0))
  })

  it('accepts plural day names', () => {
    expect(nextOccurrence(activity('Saturdays'), now)!.startsAt).toEqual(london(2026, 9, 26, 19, 0))
  })

  it('handles nth weekday of the month', () => {
    const session = nextOccurrence(activity('1st Sunday of month', '10:00 AM - 1:00 PM'), now)!

    expect(session.startsAt).toEqual(london(2026, 10, 4, 10, 0))
    expect(nextOccurrence(activity('3rd Sunday of the month', '10:00 AM - 1:00 PM'), now)!.startsAt)
      .toEqual(london(2026, 10, 18, 10, 0))
  })

  it('handles the last weekday of the month', () => {
    expect(nextOccurrence(activity('Last Friday of month'), now)!.startsAt).toEqual(london(2026, 9, 25, 19, 0))
  })

  it('treats a session finishing after midnight as ending the next day', () => {
    const session = nextOccurrence(activity('Friday', '8:00 PM - 12:30 AM'), now)!

    expect(session.endsAt).toEqual(london(2026, 9, 26, 0, 30))
  })

  it('lasts an hour when there is no end time', () => {
    const session = nextOccurrence(activity('Friday', '8pm'), now)!

    expect(session.startsAt).toEqual(london(2026, 9, 25, 20, 0))
    expect(session.endsAt).toEqual(london(2026, 9, 25, 21, 0))
  })

  it('returns null when the day or time can\'t be parsed', () => {
    expect(nextOccurrence(activity('By arrangement'), now)).toBeNull()
    expect(nextOccurrence(activity('Monday', 'Evenings'), now)).toBeNull()
    expect(nextOccurrence({ day: null, time: null }, now)).toBeNull()
  })

  it('keeps wall-clock times across the clocks changing', () => {
    // Clocks go back on Sunday 25 October 2026. A 7 PM Tuesday session is
    // 18:00 UTC before the change and 19:00 UTC after it.
    const before = nextOccurrence(activity('Tuesday'), london(2026, 10, 19, 12, 0))!
    const after = nextOccurrence(activity('Tuesday'), london(2026, 10, 26, 12, 0))!

    expect(before.startsAt.toISOString()).toBe('2026-10-20T18:00:00.000Z')
    expect(after.startsAt.toISOString()).toBe('2026-10-27T19:00:00.000Z')
  })

  it('uses the hall\'s date, not the server\'s, around midnight', () => {
    // 00:30 on Friday in London is still Thursday 23:30 in UTC.
    const justAfterMidnight = london(2026, 9, 25, 0, 30)

    expect(nextOccurrence(activity('Thursday'), justAfterMidnight)!.startsAt).toEqual(london(2026, 10, 1, 19, 0))
    expect(nextOccurrence(activity('Friday'), justAfterMidnight)!.startsAt).toEqual(london(2026, 9, 25, 19, 0))
  })
})

describe('byNextOccurrence', () => {
  it('returns every activity, soonest first, unscheduled ones last', () => {
    const schedule = byNextOccurrence([
      activity('By arrangement', undefined, 'Unscheduled Club'),
      activity('Tuesday', undefined, 'Tuesday Club'),
      activity('Thursday', undefined, 'Tonight Club'),
    ], now)

    expect(schedule.map(pair => pair.activity.title)).toEqual(['Tonight Club', 'Tuesday Club', 'Unscheduled Club'])
    expect(schedule.at(-1)!.session).toBeNull()
    expect(schedule[0]!.session!.startsAt).toEqual(london(2026, 9, 24, 19, 0))
  })
})

describe('upcoming', () => {
  it('returns scheduled activities soonest first, limited', () => {
    const sessions = upcoming([
      activity('Tuesday', undefined, 'Tuesday Club'),
      activity('Friday', undefined, 'Friday Club'),
      activity('Thursday', undefined, 'Tonight Club'),
      activity('By arrangement', undefined, 'Unscheduled Club'),
    ], 2, now)

    expect(sessions.map(pair => pair.activity.title)).toEqual(['Tonight Club', 'Friday Club'])
  })
})

describe('occurrenceLabel', () => {
  const hourFrom = (startsAt: Date) => ({ startsAt, endsAt: new Date(startsAt.getTime() + 60 * 60 * 1000) })

  it('labels sessions relative to today', () => {
    expect(occurrenceLabel(hourFrom(new Date(now.getTime() - 30 * 60 * 1000)), now)).toBe('On now')
    expect(occurrenceLabel(hourFrom(london(2026, 9, 24, 19, 30)), now)).toBe('Today · 7:30 PM')
    expect(occurrenceLabel(hourFrom(london(2026, 9, 25, 10, 0)), now)).toBe('Tomorrow · 10:00 AM')
    expect(occurrenceLabel(hourFrom(london(2026, 10, 4, 10, 0)), now)).toBe('Sun 4 Oct · 10:00 AM')
    expect(occurrenceLabel(hourFrom(london(2026, 10, 6, 12, 0)), now)).toBe('Tue 6 Oct · 12:00 PM')
  })

  it('highlights sessions that are today or under way', () => {
    expect(toOccurrence(hourFrom(london(2026, 9, 24, 19, 30)), now)!.highlight).toBe(true)
    expect(toOccurrence(hourFrom(london(2026, 9, 25, 10, 0)), now)!.highlight).toBe(false)
    expect(toOccurrence(null, now)).toBeNull()
  })
})

describe('todayLabel', () => {
  it('names the day at the hall', () => {
    expect(todayLabel(now)).toBe('Thursday 24 September')
    expect(todayLabel(london(2026, 9, 25, 0, 30))).toBe('Friday 25 September')
  })
})
