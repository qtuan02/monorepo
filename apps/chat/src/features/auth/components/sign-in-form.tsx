import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { Button } from "@monorepo/ui/components/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@monorepo/ui/components/field";
import { Input } from "@monorepo/ui/components/input";

import type { SignInFormValues } from "~/features/auth/types/sign-in-form";
import { SelectLanguage } from "~/components/select/select-language";
import { ROUTES } from "~/constants/routes";
import { useSignInSuccess } from "~/features/auth/hooks/use-sign-in-success";
import { createSignInFormSchema } from "~/features/auth/types/sign-in-form";
import { useSignInMutation } from "~/hooks/api/auth";

export default function SignInForm() {
  const { t } = useTranslation();
  const handleSuccess = useSignInSuccess();
  const signIn = useSignInMutation({ onSuccess: handleSuccess });

  // Rebuilt on every language switch — see createSignInFormSchema.
  const schema = React.useMemo(() => createSignInFormSchema(t), [t]);

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = form.handleSubmit((values) => signIn.mutate(values));

  return (
    <form
      noValidate
      className="flex w-full max-w-sm flex-col gap-4"
      onSubmit={onSubmit}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">{t("chat.auth.signIn.title")}</h1>
          <p className="text-muted-foreground text-sm">
            {t("chat.auth.signIn.subtitle")}
          </p>
        </div>
        <SelectLanguage compact triggerClassName="w-9 shrink-0 px-0" />
      </div>

      <FieldGroup className="gap-4">
        <Controller
          name="username"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="gap-1.5" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                {t("chat.auth.field.username")}
              </FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="text"
                autoComplete="username"
                placeholder={t("chat.auth.field.usernamePlaceholder")}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="gap-1.5" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                {t("chat.auth.field.password")}
              </FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="password"
                autoComplete="current-password"
                placeholder={t("chat.auth.field.passwordPlaceholder")}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Button
          type="submit"
          disabled={signIn.isPending}
          className="h-11 w-full"
        >
          {signIn.isPending
            ? t("chat.auth.signIn.submitting")
            : t("chat.auth.signIn.submit")}
        </Button>
      </FieldGroup>

      <p className="text-muted-foreground text-center text-sm">
        {t("chat.auth.signIn.noAccount")}{" "}
        <Link
          to={ROUTES.SIGN_UP}
          className="text-primary font-medium hover:underline"
        >
          {t("chat.auth.signIn.signUpLink")}
        </Link>
      </p>
    </form>
  );
}
