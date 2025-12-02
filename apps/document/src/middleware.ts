import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

// Public routes that don't require authentication
const publicRoutes = ["/sign-in"];

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Exclude auth API routes from i18n middleware and auth check
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Extract locale from pathname (format: /locale/...)
  const pathnameWithoutLocale = pathname.replace(/^\/[^/]+/, "") || "/";
  const locale = pathname.split("/")[1] || routing.defaultLocale;

  // Check if the route is public (check without locale prefix)
  const isPublicRoute = publicRoutes.some((route) =>
    pathnameWithoutLocale.startsWith(route),
  );

  // If not a public route, check authentication cookie
  // NOTE: This is an optimistic check - full validation should be done in server components/API routes
  if (!isPublicRoute) {
    const sessionCookie = getSessionCookie(request);

    if (!sessionCookie) {
      // Redirect to sign-in page with the current locale
      const signInUrl = new URL(`/${locale}/sign-in`, request.url);
      signInUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Apply i18n middleware for all other routes
  return intlMiddleware(request);
}

// Read more: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ["/", "/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
