/**
 * The one route table. Every `<Route path>`, `<Link to>` and `navigate(...)`
 * reads from here — a literal path string anywhere else drifts the moment a
 * route is renamed (see .agents/rules/routing-constants.md).
 *
 * `as const` keeps each value a literal type, so a typo fails to compile rather
 * than resolving to a 404 at runtime.
 */
export const ROUTES = {
  HOME: "/",
  COMPONENTS: "/components",
  COMPONENT_BY_SLUG: "/components/:slug",
  HOOKS: "/hooks",
  HOOK_BY_SLUG: "/hooks/:slug",

  /**
   * Builders for the dynamic segment: the `:slug` placeholder lives in exactly
   * one place (the two templates above), and no caller interpolates a path by
   * hand — not the sidebar, not a card, not a test.
   */
  componentBySlugPath: (slug: string) => `/components/${slug}`,
  hookBySlugPath: (slug: string) => `/hooks/${slug}`,
} as const;
