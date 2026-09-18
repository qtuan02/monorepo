/**
 * The one route table. Every `<Route path>`, `<Link to>` and `navigate(...)`
 * reads from here — a literal path string anywhere else drifts the moment a
 * route is renamed (see .agents/rules/routing-constants.md).
 *
 * `as const` keeps each value a literal type, so a typo fails to compile rather
 * than resolving to a 404 at runtime.
 *
 * The real screens (conversation, friends, profile) land in later tickets,
 * each adding its own entry.
 */
export const ROUTES = {
  HOME: "/",
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
} as const;
