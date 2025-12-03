/**
 * Route path constants
 */

/**
 * Public routes that don't require authentication
 */
export const PUBLIC_ROUTES = ["/sign-in"] as const;

/**
 * Auth-related route paths
 */
export const AUTH_ROUTES = {
  SIGN_IN: "/sign-in",
  CALLBACK: "/auth/callback",
  API_BASE: "/api/auth",
} as const;

/**
 * Checks if a pathname is a public route (without locale prefix)
 * @param pathnameWithoutLocale - Pathname without locale prefix
 * @returns true if the route is public
 */
export function isPublicRoute(pathnameWithoutLocale: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathnameWithoutLocale.startsWith(route));
}
