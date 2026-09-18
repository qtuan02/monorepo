"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { defaultLanguage, isLanguageCode } from "@monorepo/i18n/languages";

import { SESSION_COOKIE_NAME } from "~/constants/cookies";
import { ROUTES } from "~/constants/routes";
import { getPathname } from "~/i18n/navigation";

/**
 * Clears the session. A Server Action, so it is a POST — a GET sign-out could be
 * fired by a prefetcher or an `<img src>` and would sign a visitor out without
 * them touching anything.
 */
export async function signOutAction(formData: FormData): Promise<void> {
  const rawLocale = formData.get("locale");
  const locale = isLanguageCode(rawLocale) ? rawLocale : defaultLanguage;

  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);

  redirect(getPathname({ href: ROUTES.HOME, locale }));
}
