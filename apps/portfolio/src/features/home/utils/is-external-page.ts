/**
 * Whether a destination is a page a new tab can hold.
 *
 * Only an http(s) URL is. `tel:` and `mailto:` hand off to another
 * application, so `target="_blank"` on one opens a blank tab that is left
 * behind — visible on desktop, and on iOS Safari it is the difference between
 * the dialer opening and nothing happening at all.
 *
 * The scheme is matched in full rather than by a `"http"` prefix, which would
 * also accept `httpfoo:` — and the two call sites, the hero's quick actions
 * and the contact lines, have to agree on the answer.
 */
export function isExternalPage(href: string): boolean {
  return href.startsWith("http://") || href.startsWith("https://");
}
