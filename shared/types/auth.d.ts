/**
 * Shape of the admin session, the replacement for Devise's `current_admin_user`.
 *
 * Only what's needed to identify the user — sealed cookies cap out at 4096
 * bytes, and there's no reason to carry more.
 */
declare module '#auth-utils' {
  interface User {
    id: number
    email: string
  }

  interface UserSession {
    loggedInAt?: string
  }
}

export {}
