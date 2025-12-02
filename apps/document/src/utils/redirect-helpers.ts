import type { NextRequest } from "next/server";

import { extractLocale } from "./path-helpers";

/**
 * Creates a sign-in redirect URL with the current locale and original pathname
 * @param request - The Next.js request object
 * @param pathname - The original pathname to redirect back to after sign-in
 * @returns A URL object for the sign-in page with redirect parameter
 */
export function createSignInRedirectUrl(
  request: NextRequest,
  pathname: string,
): URL {
  const locale = extractLocale(pathname);
  const signInUrl = new URL(`/${locale}/sign-in`, request.url);
  signInUrl.searchParams.set("redirect", pathname);
  return signInUrl;
}

