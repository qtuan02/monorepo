import { href, redirect } from "react-router";

import type { Route } from "./+types/sign-out";
import { destroySession, getSession } from "~/libs/session.server";

/**
 * A resource route: no default export, so nothing renders here and the module
 * answers with a `Response` and nothing else. It sits outside the shell and
 * outside the guard in `src/routes.ts` — a signed-out visitor posting here is
 * a no-op, not a bounce to sign-in.
 *
 * Signing out is the `action`, and therefore a POST. A GET sign-out could be
 * fired by a link prefetch or an `<img src>` and would sign a visitor out
 * without them touching anything — the same reason the Next Template makes it
 * a Server Action. `destroySession` expires the cookie; the redirect home
 * carries that `Set-Cookie`, and the client router revalidates every loader
 * on a redirect that sets a cookie, so the shell re-renders signed out.
 */
export async function action({ request, url }: Route.ActionArgs) {
  /*
   * The framework's own CSRF check (`Origin` against `request.url`, plus
   * `allowedActionOrigins`) runs for document and `.data` actions — and NOT
   * for a resource route, which is what this module is. Without this line a
   * page on any other origin could auto-submit a form here and expire the
   * visitor's cookie: `SameSite=Lax` withholds the cookie from that request,
   * but the browser still honours the `Set-Cookie` on the response. Compared on
   * host, like the framework does, because behind a TLS proxy the scheme of
   * `url` is not the browser's.
   */
  const origin = request.headers.get("Origin");

  if (origin && origin !== "null" && new URL(origin).host !== url.host) {
    throw new Response(null, { status: 403 });
  }

  const session = await getSession(request.headers.get("Cookie"));

  throw redirect(href("/"), {
    headers: { "Set-Cookie": await destroySession(session) },
  });
}

/**
 * A GET to this URL goes home and touches no cookie. The loader exists so the
 * URL answers at all — a resource route with no loader has nothing to answer a
 * GET with — and it is the half of the rule above that a test can pin: the
 * session survives it.
 */
export function loader() {
  throw redirect(href("/"));
}
