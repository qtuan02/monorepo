import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";

import { LOCALE_COOKIE_NAME } from "./constants/common";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const intlMiddleware = createMiddleware(routing);

  const res = intlMiddleware(request);
  res.headers.set("x-current-path", request.nextUrl.pathname);
  res.headers.set("x-hostname", request.headers.get("host") || "");
  res.headers.set("x-user-agent", request.headers.get("user-agent") || "");

  let locale = request.nextUrl.pathname.split("/")[1];

  const isMissingLocale =
    !locale ||
    (locale &&
      !routing.locales.includes(locale as (typeof routing.locales)[number]));

  if (isMissingLocale) {
    locale = routing.defaultLocale;
  }

  if (!request.cookies.get(LOCALE_COOKIE_NAME)) {
    res.cookies.set(LOCALE_COOKIE_NAME, locale || routing.defaultLocale);
  }

  return res;
}

export const config = {
  matcher: ["/", "/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
