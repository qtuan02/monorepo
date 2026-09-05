import type { MiddlewareFunction } from "react-router";
import { href, replace } from "react-router";

import { userContext } from "~/features/auth/middleware/user-context";
import { SIGN_IN_REDIRECT_PARAM } from "~/features/auth/utils/redirect-param";
import { normalizeRequestPath } from "~/features/auth/utils/request-path";
import { getSessionUser } from "~/libs/session.server";

/**
 * The session guard — this Runtime's `decideSessionRedirect` and `proxy.ts`
 * in one function, because here the framework hands middleware a real
 * `Request` and a way to throw a `Response`, so there is no HTTP adapter to
 * keep separate from the decision. It is still a plain function over a
 * `Request` and a `RouterContextProvider`, which is what
 * `test/features/auth/middleware/require-session.test.ts` calls it as.
 *
 * Mounted on the pathless `layout()` that wraps the guarded group
 * (`~/routes/protected`), so which paths are gated is decided by the route
 * table, not by a prefix list. Two properties of that route module are
 * load-bearing and are documented there: it must export a `loader`, and the
 * guard must `throw` rather than `return` the redirect.
 *
 * Typed as the package's `MiddlewareFunction<Response>` rather than one route's
 * `Route.MiddlewareFunction`, so it can be mounted on any route module.
 */
export const requireSession: MiddlewareFunction<Response> = async (
  { request, url, context },
  next,
) => {
  const user = await getSessionUser(request);

  if (!user) {
    /*
     * `redirectTo` has to be the page, not the request. On a client-side
     * navigation this middleware runs for a `.data` fetch, and `request.url`
     * is that fetch — `url` is the framework's normalized location, and the
     * helper makes the same guarantee on either (see `normalizeRequestPath`).
     * The search string rides along so `/dashboard?tab=billing` comes back
     * with its filters, which is the one thing `redirectTo` exists to keep.
     *
     * `replace`, not `redirect`: the bounce leaves no history entry, so Back
     * from the sign-in screen goes to where the visitor was before they tried
     * the guarded page — not into a loop of redirects to sign-in.
     */
    const search = new URLSearchParams({
      [SIGN_IN_REDIRECT_PARAM]: normalizeRequestPath(url),
    });

    throw replace(`${href("/sign-in")}?${search}`);
  }

  context.set(userContext, user);

  return next();
};
