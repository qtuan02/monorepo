import type { NextRequest } from "next/server";

import { createI18nProxy } from "@monorepo/i18n/next-intl/create-proxy";

import { routing } from "~/i18n/routing";

const negotiateLocale = createI18nProxy(routing);

/**
 * `proxy.ts`, not `middleware.ts`: Next 16 renamed the file and the export, and
 * the proxy runs on the **Node** runtime, which cannot be configured back to
 * edge.
 *
 * This app is a public CV with no account, so there is no session guard to run
 * before the locale is negotiated — the Template's `features/auth` slice, its
 * sign-in screen and its protected route group were all dropped rather than
 * kept with an empty prefix list, which would have published a login screen
 * nobody can use or left a redirect pointing at a route that no longer exists.
 * The guard itself is not lost: it lives in `apps/_template_next` and arrives
 * with `gen:app` for an app that genuinely needs one.
 */
export function proxy(request: NextRequest) {
  return negotiateLocale(request);
}

/**
 * Every path except the API routes, Next's own assets, and anything with a dot
 * in it (a file).
 *
 * Written as a **literal**, never the `I18N_PROXY_MATCHER` constant it copies:
 * Next extracts this `config` by statically analysing the file, so an identifier
 * it cannot evaluate counts as a dynamic value and is silently ignored — the
 * proxy would then run on every request, static assets included, with nothing to
 * warn you.
 */
export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
