"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { defaultLanguage, isLanguageCode } from "@monorepo/i18n/languages";

import { SESSION_COOKIE_NAME } from "~/constants/cookies";
import { ROUTES } from "~/constants/routes";
import { env } from "~/env";
import { safeRedirectTo } from "~/features/auth/guard/safe-redirect-to";
import { getPathname } from "~/i18n/navigation";

/** Eight hours — long enough for a shift, short enough to expire overnight. */
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

/**
 * Mints the session cookie the proxy guard checks for.
 *
 * There is no credential check: this template has no auth backend, and pretending
 * otherwise would hide the one thing worth copying — that the session is an
 * `HttpOnly` cookie written by a Server Action, so no script can read it and the
 * app needs no auth store at all. Replace the body with a real service call and
 * everything around it stays as-is.
 */
export async function signInAction(formData: FormData): Promise<void> {
  const rawLocale = formData.get("locale");
  const locale = isLanguageCode(rawLocale) ? rawLocale : defaultLanguage;

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, "template-session", {
    // The whole point: unreadable from JavaScript, so it cannot leak through an
    // XSS the way a token in localStorage would.
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    // Read from validated app config rather than `process.env.NODE_ENV`: a
    // `secure` cookie is never sent over plain http, so hard-coding `true` would
    // break local development on http://localhost.
    secure: env.NEXT_PUBLIC_APP_ENV !== "local",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  redirect(
    safeRedirectTo(formData.get("redirectTo")) ??
      getPathname({ href: ROUTES.DASHBOARD, locale }),
  );
}
