import type { LucideProps } from "lucide-react";
import type * as React from "react";

/**
 * A lucide icon as a component. Spelled `ComponentType` rather than lucide's own
 * `ForwardRefExoticComponent<…>`: React 19 passes `ref` as a plain prop, so the
 * forwardRef spelling names an implementation detail this app no longer has.
 */
export type IconComponent = React.ComponentType<LucideProps>;

/**
 * The module ids this app ships. They double as message keys
 * (`home.modules.<id>.title`) AND as the `:slug` of `/modules/:slug`, so the
 * registry in `@monorepo/i18n` is what decides whether a new id is renderable,
 * and the catalogue is what decides whether a slug is a page.
 */
export const homeModuleIds = [
  "dashboard",
  "pos",
  "patients",
  "medications",
  "analytics",
  "appointments",
] as const;

export type HomeModuleId = (typeof homeModuleIds)[number];

/**
 * One entry of the catalogue as the `loader` hands it over. Data only — no icon
 * component and no path: loader data is serialized into the hydration payload,
 * and a component reference is not serializable. The template joins an id to
 * its icon on the way out, and builds the link with `href("/modules/:slug")`
 * so the path table stays in `src/routes.ts` rather than being copied into
 * data (contrast the Next Template, whose catalogue carries `href` because its
 * `ROUTES` constant is plain data too).
 */
export interface HomeModule {
  id: HomeModuleId;
  /** Not yet built — the module page renders the `comingSoon.*` copy. */
  comingSoon?: boolean;
}
