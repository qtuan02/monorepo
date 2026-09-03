import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();

  res.headers.set("x-current-path", request.nextUrl.pathname);
  res.headers.set("x-hostname", request.headers.get("host") || "");
  res.headers.set("x-user-agent", request.headers.get("user-agent") || "");

  const cacheIdCookie = request.cookies.get("_portfolio_cache_id");

  const cacheId = cacheIdCookie?.value || crypto.randomUUID();

  if (!cacheIdCookie?.value) {
    res.cookies.set("_portfolio_cache_id", cacheId, {
      maxAge: 60 * 60 * 24, // 1 day
    });
  }

  return res;
}

export const config = {
  matcher: ["/", "/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
