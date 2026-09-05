import type { MiddlewareFunction } from "react-router";
import { href, replace } from "react-router";

import { getSessionUser } from "~/libs/session.server";

/**
 * The other half of the session rule: a signed-in visitor landing on sign-in
 * goes to the dashboard instead of being offered a second session. Same
 * reasoning as the SPA's `GuestRoute` and the guest branch of the Next
 * Template's `decideSessionRedirect`.
 *
 * Mounted on the sign-in route module, where middleware runs before the
 * `action` as well as before the `loader` — so a POST from a stale tab that
 * already holds a session is bounced too, rather than minting a fresh cookie
 * over the existing one.
 */
export const guestOnly: MiddlewareFunction<Response> = async (
  { request },
  next,
) => {
  if (await getSessionUser(request)) {
    throw replace(href("/dashboard"));
  }

  return next();
};
