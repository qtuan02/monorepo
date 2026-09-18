import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { createI18nProxy } from "@monorepo/i18n/next-intl/create-proxy";

import { SESSION_COOKIE_NAME } from "~/constants/cookies";
import { SIGN_IN_REDIRECT_PARAM } from "~/features/auth/guard/redirect-param";
import { decideSessionRedirect } from "~/features/auth/guard/session-guard";
import { routing } from "~/i18n/routing";

const negotiateLocale = createI18nProxy(routing);

/**
 * `proxy.ts`, not `middleware.ts`: Next 16 renamed the file and the export, and
 * the proxy runs on the **Node** runtime, which cannot be configured back to
 * edge. That is what lets a guard here share modules with the rest of the app
 * instead of living in a second, edge-shaped world.
 *
 * Two jobs in a fixed order. The guard runs first, because sending a signed-out
 * visitor to sign-in is cheaper than negotiating a locale for a page they will
 * never see — and because the redirect it builds keeps whatever prefix the
 * request already carried, so next-intl has nothing left to normalise. Anything
 * the guard lets through is handed to next-intl, which rewrites or redirects for
 * the locale.
 */
export function proxy(request: NextRequest) {
  const redirect = decideSessionRedirect({
    pathname: request.nextUrl.pathname,
    search: request.nextUrl.search,
    hasSession: request.cookies.has(SESSION_COOKIE_NAME),
  });

  if (redirect) {
    const url = request.nextUrl.clone();
    url.pathname = redirect.pathname;
    // The guarded URL's own query must not ride along to sign-in — it is
    // preserved inside `redirectTo` instead, which is what sends the visitor
    // back to the *whole* URL they asked for once they are signed in.
    url.search = "";

    if (redirect.redirectTo) {
      url.searchParams.set(SIGN_IN_REDIRECT_PARAM, redirect.redirectTo);
    }

    return NextResponse.redirect(url);
  }

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
