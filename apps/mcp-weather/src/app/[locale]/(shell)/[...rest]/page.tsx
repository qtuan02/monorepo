import { notFound } from "next/navigation";

/**
 * Turns an unmatched path into a real 404.
 *
 * Without it Next renders its **own** built-in 404 for a path that matches no
 * route — the localized `not-found.tsx` beside this file is only reached when
 * `notFound()` is actually called inside the segment. So the catch-all exists to
 * call it.
 *
 * No `: never` return annotation, even though `notFound()` is typed that way: a
 * function *declared* to return `never` may not have a reachable end point.
 *
 * Under `cacheComponents` this route answers with a **404 status and a body the
 * client resumes**, rather than the 404 markup inline. That is not an oversight:
 * `notFound()` throws before a static shell exists, so Next stores the status in
 * the route's `.meta` and defers the UI. Rendering it at request time instead
 * (`await connection()` + `export const instant = false`) does inline the markup
 * — and drops the status to 200, because `not-found.js` is documented as 200 for
 * a streamed response. The status is what crawlers and monitors act on, so it
 * wins. `e2e/server-rendering.e2e.ts` asserts both halves.
 */
export default function CatchAllPage() {
  notFound();
}
