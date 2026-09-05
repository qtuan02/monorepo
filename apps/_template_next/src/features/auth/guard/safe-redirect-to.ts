/**
 * An origin no host can ever resolve to, used only as the base a candidate
 * `redirectTo` is resolved against. `.invalid` is reserved by RFC 2606 exactly
 * so it can never be a real destination.
 */
const RESOLUTION_BASE = "http://redirect.invalid";

/**
 * Narrows an untrusted `redirectTo` to a path on this origin, or `undefined`.
 *
 * `redirectTo` arrives in the query string and is copied verbatim into the
 * sign-in form, so without this a link like
 * `/sign-in?redirectTo=https://evil.example` would turn the app's own sign-in
 * into an open redirect — a visitor typing credentials on the real domain and
 * landing on someone else's.
 *
 * The check **parses** rather than pattern-matches, because the strings that
 * escape this origin do not all look alike. `//evil.example` is protocol-relative
 * and obvious; `/\evil.example` is not, and a `startsWith("//")` test waves it
 * through — the URL spec says a backslash in a special-scheme URL is a `/`, so
 * every browser resolves the `Location` header it produces to `https://evil.example/`.
 * Next embeds whatever `redirect()` is handed straight into the header without
 * normalising it, so this function is the only thing standing between the two.
 *
 * Resolving against an unreachable base and demanding the origin come back
 * unchanged catches that whole family at once, and rebuilding the return value
 * from the parsed parts means what the caller gets is what was actually parsed.
 */
export function safeRedirectTo(
  value: FormDataEntryValue | null,
): string | undefined {
  if (typeof value !== "string") return undefined;
  // A rooted path, so a bare `dashboard` cannot ride in as a relative one.
  if (!value.startsWith("/")) return undefined;

  let url: URL;

  try {
    url = new URL(value, RESOLUTION_BASE);
  } catch {
    return undefined;
  }

  if (url.origin !== RESOLUTION_BASE) return undefined;

  // The origin check alone is not enough. WHATWG path normalisation collapses
  // `.` and `..` segments but keeps the EMPTY segment after them, so
  // `/..//evil.example` (or `/.//`, `/a/..//`, `/%2e%2e//`) parses on this
  // origin and comes back out as the protocol-relative `//evil.example` —
  // which the browser, and React Router's own absolute-URL test, then read as
  // https://evil.example/. The rebuilt value is what the caller will hand to
  // `redirect()`, so it is the rebuilt value that has to be safe.
  if (url.pathname.startsWith("//")) return undefined;

  return `${url.pathname}${url.search}${url.hash}`;
}
