/**
 * Guards `/api/admin/**` centrally.
 *
 * The Rails equivalent is `before_action :authenticate_admin_user!` on
 * `Admin::BaseController`, which every admin controller inherits. Doing it in
 * middleware rather than per-handler means a new admin endpoint is protected by
 * default — forgetting the call can't quietly expose one.
 */
export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname

  if (!path.startsWith('/api/admin/')) return
  // The login endpoint is the way in, so it can't require a session.
  if (path === '/api/admin/login') return

  await requireUserSession(event)
})
