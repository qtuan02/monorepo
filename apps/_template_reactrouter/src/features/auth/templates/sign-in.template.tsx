import { useTranslation } from "react-i18next";
import { Form } from "react-router";

import { Button } from "@monorepo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";
import { Field, FieldGroup, FieldLabel } from "@monorepo/ui/components/field";
import { Input } from "@monorepo/ui/components/input";

import { SelectLanguage } from "~/components/select/select-language";
import { SIGN_IN_REDIRECT_PARAM } from "~/features/auth/utils/redirect-param";

interface SignInTemplateProps {
  /**
   * Where to go after signing in, already narrowed to a path on this origin by
   * the route's loader. Absent when the visitor came here on their own.
   */
  redirectTo?: string;
}

/**
 * The guest screen. It renders OUTSIDE the shell (`src/routes.ts` mounts the
 * sign-in route beside the layout, not under it), so unlike every other
 * template here it owns its own `<main>` and its own viewport-height
 * centering — there is no `BodyTemplate` around it to provide either.
 *
 * `<Form method="post">` from react-router, not a `<form>`: without JavaScript
 * it is a plain HTML POST to this URL, handled by the route's `action`; once
 * hydrated the same submission goes through the client router, which then
 * follows the action's redirect without a full reload. Authentication depends
 * on neither hydration nor a store — the whole point of a cookie session.
 *
 * The language switcher is here because this is the one screen the shell's
 * header does not reach; it switches in place and the loader re-runs on
 * `languageChanged` (root's `App` revalidates), so `redirectTo` survives it.
 */
export default function SignInTemplate({ redirectTo }: SignInTemplateProps) {
  const { t } = useTranslation();

  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <div className="flex w-full max-w-sm flex-col gap-3">
        <div className="flex justify-end">
          <SelectLanguage />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              <h1>{t("auth.signIn.title")}</h1>
            </CardTitle>
            <CardDescription>{t("auth.signIn.hero.tagline")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form method="post">
              <FieldGroup>
                {/* Rendered only when there is somewhere to go back to: an
                    empty hidden field would post `redirectTo=""`, which the
                    action would narrow to nothing anyway, but the form should
                    say what it means. The value is already narrowed by the
                    loader, so a `?redirectTo=https://evil.example` never
                    reaches this input. */}
                {redirectTo ? (
                  <input
                    type="hidden"
                    name={SIGN_IN_REDIRECT_PARAM}
                    value={redirectTo}
                  />
                ) : null}

                <Field>
                  <FieldLabel htmlFor="username">
                    {t("auth.signIn.username")}
                  </FieldLabel>
                  <Input
                    id="username"
                    name="username"
                    autoComplete="username"
                    // The first field of the only form on the page: focusing
                    // it on load saves a click for keyboard and password-
                    // manager users, and there is nothing else here to
                    // steal focus from.
                    autoFocus
                  />
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
              </FieldGroup>
            </Form>

            <p className="text-muted-foreground mt-4 text-xs">
              {t("auth.signIn.support")}
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
