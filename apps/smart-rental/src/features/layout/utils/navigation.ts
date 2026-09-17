import type { NavigationItem } from "~/features/layout/constants/navigation";
import { ROUTES } from "~/constants/routes";
import {
  dashboardItem,
  navigationSections,
} from "~/features/layout/constants/navigation";

const navigationItems = navigationSections.flatMap((section) => section.items);

/**
 * Whether `pathname` falls under a sidebar area. `/` matches only itself;
 * every other area also owns its sub-paths (`/contracts/c-1/renew` is still
 * "Hợp đồng"), matched on a segment boundary so `/rooms-x` is not `/rooms` —
 * one step stricter than the prototype's bare `startsWith`.
 */
export function isNavigationItemActive(
  item: NavigationItem,
  pathname: string,
): boolean {
  if (item.path === ROUTES.HOME) return pathname === ROUTES.HOME;
  return pathname === item.path || pathname.startsWith(`${item.path}/`);
}

/** The area the header names for a path; the dashboard when none matches. */
export function resolveNavigationItem(pathname: string): NavigationItem {
  return (
    navigationItems.find((item) => isNavigationItemActive(item, pathname)) ??
    dashboardItem
  );
}
