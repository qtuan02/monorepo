import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import createMiddleware from "next-intl/middleware";

import { AUTH_ROUTES, isPublicRoute } from "./constants/routes";
import { routing } from "./i18n/routing";
import { parsePathname } from "./utils/path-helpers";
import { createSignInRedirectUrl } from "./utils/redirect-helpers";

const intlMiddleware = createMiddleware(routing);

/**
 * Middleware function that handles internationalization and authentication.
 *
 * - Excludes auth API routes from processing
 * - Checks if routes are public (sign-in)
 * - Validates authentication cookie for protected routes
 * - Applies i18n middleware and sets pathname header
 *
 * @param request - The incoming Next.js request
 * @returns NextResponse with appropriate headers and redirects
 */
export default async function middleware(
  request: NextRequest,
): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Exclude auth API routes from i18n middleware and auth check
  if (pathname.startsWith(AUTH_ROUTES.API_BASE)) {
    return NextResponse.next();
  }

  // Extract locale and pathname information
  const { pathnameWithoutLocale } = parsePathname(pathname);

  // Check if the route is public (check without locale prefix)
  const isPublic = isPublicRoute(pathnameWithoutLocale);

  // If not a public route, check authentication cookie
  // NOTE: This is an optimistic check - full validation should be done in server components/API routes
  if (!isPublic) {
    const sessionCookie = getSessionCookie(request);

    if (!sessionCookie) {
      // Redirect to sign-in page with the current locale
      const signInUrl = createSignInRedirectUrl(request, pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Apply i18n middleware for all other routes
  const res = intlMiddleware(request);

  // Set pathname in header for server components
  res.headers.set("x-current-path", pathname);

  return res;
}

// Read more: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ["/", "/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
