/**
 * The one route table, written **without** a locale prefix.
 *
 * Next has no typed `href()` the way React Router's framework mode does, and the
 * App Router's file tree is not importable, so a literal path in a component
 * would drift the moment a folder is renamed. Every value here is handed to
 * next-intl's `Link` / `redirect` / `getPathname`, which add the prefix for the
 * active locale — so no caller ever writes `/vi/...` by hand.
 *
 * This app is a single public screen, so the table has one entry. There is no
 * `PROTECTED_ROUTE_PREFIXES`: nothing here is guarded, which is why `proxy.ts`
 * carries locale negotiation and nothing else.
 */
export const ROUTES = {
  HOME: "/",
} as const;
