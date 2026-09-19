import { matchPath } from "react-router";

import type { NavigationItem } from "~/features/layout/constants/navigation";
import { ROUTES } from "~/constants/routes";
import {
  dashboardItem,
  hiddenNavigationItems,
  navigationSections,
} from "~/features/layout/constants/navigation";

const navigationItems = [
  ...navigationSections.flatMap((section) => section.items),
  ...hiddenNavigationItems,
];

/**
 * Whether `pathname` falls under a sidebar area, matched against `match` (a
 * `ROUTES` pattern) with react-router's own `matchPath` — so a dynamic
 * segment (Kỳ's `/cycles/:month`) is active for every month, not just the
 * one resolved at import. `/` matches only itself (`end: true`); every
 * other area also owns its sub-paths (`/contracts/c-1/renew` is still
 * "Hợp đồng"), which `matchPath` already keeps on a segment boundary so
 * `/rooms-x` is not `/rooms`.
 */
export function isNavigationItemActive(
  item: NavigationItem,
  pathname: string,
): boolean {
  return (
    matchPath(
      { path: item.match, end: item.match === ROUTES.HOME },
      pathname,
    ) !== null
  );
}

/** Resolves an item's `<Link>` target — calling it when it depends on "now" (Kỳ → the current month), so that never happens once at import. */
export function resolveNavigationItemTo(item: NavigationItem): string {
  return typeof item.to === "function" ? item.to() : item.to;
}

/** The area the header names for a path; the dashboard when none matches. */
export function resolveNavigationItem(pathname: string): NavigationItem {
  return (
    navigationItems.find((item) => isNavigationItemActive(item, pathname)) ??
    dashboardItem
  );
}
