import { Suspense } from "react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@monorepo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";
import { Field, FieldLabel } from "@monorepo/ui/components/field";
import { Input } from "@monorepo/ui/components/input";

import { signInAction } from "~/features/auth/actions/sign-in";
import RedirectToField from "~/features/auth/components/redirect-to-field";

interface SignInTemplateProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * The guest screen. No `"use client"` anywhere in it: the form posts straight to
 * a Server Action, so signing in works with JavaScript disabled and the page
 * ships no bundle of its own.
 */
export default function SignInTemplate({ searchParams }: SignInTemplateProps) {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">
            <h1>{t("auth.signIn.title")}</h1>
          </CardTitle>
          <CardDescription>{t("auth.signIn.hero.tagline")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={signInAction} className="flex flex-col gap-4">
            <input type="hidden" name="locale" value={locale} />
            {/* Streams in on its own so `searchParams` cannot block the shell. */}
            <Suspense fallback={null}>
              <RedirectToField searchParams={searchParams} />
            </Suspense>

            <Field>
              <FieldLabel htmlFor="username">
                {t("auth.signIn.username")}
              </FieldLabel>
              <Input id="username" name="username" autoComplete="username" />
            </Field>

            <Field>
              <FieldLabel htmlFor="password">
                {t("auth.signIn.password")}
              </FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
              />
            </Field>

            <Button type="submit" className="mt-2">
              {t("auth.signIn.submit")}
            </Button>
          </form>

          <p className="mt-4 text-xs text-muted-foreground">
            {t("auth.signIn.support")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
