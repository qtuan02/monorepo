import { cookies } from "next/headers";
import { getLocale, getTranslations } from "next-intl/server";

import { Button } from "@monorepo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";

import { SESSION_COOKIE_NAME } from "~/constants/cookies";
import { signOutAction } from "~/features/auth/actions/sign-out";

/**
 * The one piece of this page that depends on the request. It reads the session
 * cookie, so with `cacheComponents` on it **must** sit inside a `<Suspense>`
 * boundary — the dashboard template is what provides one. Everything around it
 * stays in the static shell and paints immediately.
 *
 * `getTranslations`, not `useTranslations`: this is an async component, and a
 * hook cannot be called in one.
 */
export default async function SessionCard() {
  const [t, locale, cookieStore] = await Promise.all([
    getTranslations(),
    getLocale(),
    cookies(),
  ]);

  const hasSession = cookieStore.has(SESSION_COOKIE_NAME);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>{t("header.user.name")}</h2>
        </CardTitle>
        <CardDescription>{t("header.user.role")}</CardDescription>
      </CardHeader>
      <CardContent>
        {hasSession ? (
          <form action={signOutAction}>
            <input type="hidden" name="locale" value={locale} />
            <Button type="submit" variant="outline">
              {t("auth.signOut")}
            </Button>
          </form>
        ) : null}
      </CardContent>
    </Card>
  );
}
