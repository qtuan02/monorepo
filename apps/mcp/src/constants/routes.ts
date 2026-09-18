/**
 * The one route table, written **without** a locale prefix.
 *
 * Next has no typed `href()` the way React Router's framework mode does, and the
 * App Router's file tree is not importable, so a literal path in a component
 * would drift the moment a folder is renamed. Every value here is handed to
 * next-intl's `Link` / `redirect` / `getPathname`, which add the prefix for the
 * active locale — so no caller ever writes `/vi/...` by hand.
 *
 * `as const` keeps each value a literal type, which is also what lets next-intl
 * check the pathname against its routing config.
 */
export const ROUTES = {
  HOME: "/",
  SIGN_IN: "/sign-in",
  DASHBOARD: "/dashboard",
} as const;

/** Every path the session guard treats as protected, matched by prefix. */
export const PROTECTED_ROUTE_PREFIXES = [ROUTES.DASHBOARD] as const;
