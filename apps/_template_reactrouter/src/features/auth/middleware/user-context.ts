import { createContext } from "react-router";

import type { SessionUser } from "~/types/session-user";

/**
 * The signed-in user of the request being handled, written by `requireSession`
 * and read by every loader beneath the guard.
 *
 * Deliberately created with NO default value, the opposite choice from
 * `~/libs/language-context`. `RouterContextProvider.get()` throws when a
 * context was never set and has no default — and that throw is the feature: a
 * loader that reads this outside the guarded group is a route that was mounted
 * in the wrong place in `src/routes.ts`, and it should fail loudly on its first
 * request rather than render for a visitor nobody checked. A `null` default
 * would turn that misconfiguration into a page that quietly shows no user.
 */
export const userContext = createContext<SessionUser>();
