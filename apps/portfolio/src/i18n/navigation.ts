import { createNavigation } from "next-intl/navigation";

import { routing } from "~/i18n/routing";

/**
 * Locale-aware replacements for `next/link` and `next/navigation`. `Link`,
 * `redirect` and `getPathname` take an unprefixed path from `~/constants/routes`
 * and apply the active locale's prefix; `usePathname` gives it back without one,
 * which is what makes "switch language, stay on this page" a one-liner.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
