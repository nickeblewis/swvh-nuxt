/**
 * The equivalent of Rails' `notice` / `alert` flash.
 *
 * A page sets a message before `navigateTo`; the layout `take()`s it on the way
 * through, which reads and clears in one go. That gives the same show-exactly-once
 * behaviour as Rails without needing a redirect round-trip.
 */
export function useFlash() {
  const notice = useState<string | null>('flash:notice', () => null)
  const alert = useState<string | null>('flash:alert', () => null)

  return {
    notice,
    alert,

    setNotice(message: string) {
      notice.value = message
      alert.value = null
    },

    setAlert(message: string) {
      alert.value = message
      notice.value = null
    },

    /** Read the current messages and clear them. */
    take() {
      const taken = { notice: notice.value, alert: alert.value }
      notice.value = null
      alert.value = null
      return taken
    },
  }
}
