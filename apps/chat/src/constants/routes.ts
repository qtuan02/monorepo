/**
 * The one route table. Every `<Route path>`, `<Link to>` and `navigate(...)`
 * reads from here — a literal path string anywhere else drifts the moment a
 * route is renamed (see .agents/rules/routing-constants.md).
 *
 * `as const` keeps each value a literal type, so a typo fails to compile rather
 * than resolving to a 404 at runtime.
 *
 * Only the two routes this skeleton ships. The real screens (conversation,
 * friends, profile, sign-up) land in later tickets, each adding its own entry.
 */
export const ROUTES = {
  HOME: "/",
  SIGN_IN: "/sign-in",
} as const;
