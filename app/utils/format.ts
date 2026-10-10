/**
 * Formatting helpers. Dates are rendered in the hall's time zone so the server
 * render and the browser agree.
 */

function formatIn(value: string | Date | null | undefined, month: 'short' | 'long'): string {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month,
    year: 'numeric',
    timeZone: useSite().timeZone,
  }).format(date)
}

/** "9 Oct 2026" */
export function formatShortDate(value: string | Date | null | undefined): string {
  return formatIn(value, 'short')
}

/** "9 October 2026" */
export function formatLongDate(value: string | Date | null | undefined): string {
  return formatIn(value, 'long')
}

/** "1 min" / "2 mins", or with an irregular plural: "1 person" / "40 people". */
export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`
}
