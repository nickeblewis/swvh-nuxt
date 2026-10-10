/**
 * Client-side guard for admin pages.
 *
 * This is convenience only — the real protection is the Nitro middleware on
 * `/api/admin/**`, which runs regardless of what the browser does.
 */
export default defineNuxtRouteMiddleware(() => {
  const { loggedIn } = useUserSession()

  if (!loggedIn.value) {
    return navigateTo('/admin/login')
  }
})
