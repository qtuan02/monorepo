/**
 * Whether a request path is the generated social card under a locale segment
 * — `/vi/opengraph-image`, `/en/opengraph-image`. Twitter/X reads the same
 * route; there is no `twitter-image` file to match.
 *
 * Next links these at their **real** segment path, locale prefix included, and
 * `localePrefix: "as-needed"` would answer the default locale's one with a 307
 * to the bare path before rewriting it back. An unfurler fetching `og:image`
 * has to get the bytes on the first request, so `proxy.ts` lets a matching path
 * through untouched: its locale is already in the URL it was linked with.
 *
 * Only the prefixed shape matches. A bare `/opengraph-image` still negotiates,
 * which rewrites it onto the default locale's image like any other page.
 */
export function isMetadataImagePath(pathname: string): boolean {
  return /^\/[^/]+\/opengraph-image$/.test(pathname);
}
