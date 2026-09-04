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
 * (`home.modules.<id>.title`), so the registry in `@monorepo/i18n` is what
 * decides whether a new id is renderable.
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
 * One entry of the catalogue as the server hands it over. Data only — no icon
 * component: a `"use cache"` result has to be serializable, and a component
 * reference is not. The template maps an id to its icon on the way out.
 */
export interface HomeModule {
  id: HomeModuleId;
  href: string;
  /** Not yet built — the card renders muted and does not link anywhere. */
  comingSoon?: boolean;
}
