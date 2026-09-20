import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { Button, buttonVariants } from "@monorepo/ui/components/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@monorepo/ui/components/field";
import { Input } from "@monorepo/ui/components/input";
import { cn } from "@monorepo/ui/utils/cn";

import type { SignUpFormValues } from "~/features/auth/types/sign-up-form";
import { ROUTES } from "~/constants/routes";
import { useSignInSuccess } from "~/features/auth/hooks/use-sign-in-success";
import { createSignUpFormSchema } from "~/features/auth/types/sign-up-form";
import { useSignInMutation, useSignUpMutation } from "~/hooks/api/auth";

type CreatedCredentials = Pick<SignUpFormValues, "username" | "password">;

export default function SignUpForm() {
  const { t } = useTranslation();
  const handleSignInSuccess = useSignInSuccess();
  const [createdCredentials, setCreatedCredentials] =
    React.useState<CreatedCredentials | null>(null);

  const signUp = useSignUpMutation();
  const signIn = useSignInMutation({ onSuccess: handleSignInSuccess });

  // Rebuilt on every language switch — see createSignUpFormSchema.
  const schema = React.useMemo(() => createSignUpFormSchema(t), [t]);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      username: "",
      password: "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    signUp.mutate(values, {
      onSuccess: () =>
        setCreatedCredentials({
          username: values.username,
          password: values.password,
        }),
    });
  });

  if (createdCredentials) {
    return (
      <div className="flex w-full max-w-sm flex-col items-center gap-4 text-center">
        <h1 className="text-2xl font-bold">
          {t("chat.auth.signUp.createdTitle")}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t("chat.auth.signUp.createdSubtitle")}
        </p>
        <Button
          type="button"
          disabled={signIn.isPending}
          className="h-11 w-full"
          onClick={() => signIn.mutate(createdCredentials)}
        >
          {signIn.isPending
            ? t("chat.auth.signIn.submitting")
            : t("chat.auth.signUp.confirmSignIn")}
        </Button>
        {/* A navigation link styled as a button — never `Button` itself, which
            assumes a native <button> (see .agents/rules/architecture-ui-
            primitives.md, "A link that looks like a button"). */}
        <Link
          to={ROUTES.SIGN_IN}
          className={cn(buttonVariants({ variant: "link" }), "h-auto p-0")}
        >
          {t("chat.auth.signUp.goToSignIn")}
        </Link>
      </div>
    );
  }

  return (
    <form
      noValidate
      className="flex w-full max-w-sm flex-col gap-4"
      onSubmit={onSubmit}
    >
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-2xl font-bold">{t("chat.auth.signUp.title")}</h1>
        <p className="text-muted-foreground text-sm">
          {t("chat.auth.signUp.subtitle")}
        </p>
      </div>

      <FieldGroup className="gap-4">
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="gap-1.5" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                {t("chat.auth.field.email")}
              </FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="firstName"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  {t("chat.auth.field.firstName")}
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="text"
                  autoComplete="given-name"
                  placeholder="Tuan"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="lastName"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  {t("chat.auth.field.lastName")}
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="text"
                  autoComplete="family-name"
                  placeholder="Huynh"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

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
                placeholder="tuanhq02"
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
                autoComplete="new-password"
                placeholder={t("chat.auth.field.passwordPlaceholder")}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Button
          type="submit"
          disabled={signUp.isPending}
          className="h-11 w-full"
        >
          {signUp.isPending
            ? t("chat.auth.signUp.submitting")
            : t("chat.auth.signUp.submit")}
        </Button>
      </FieldGroup>

      <p className="text-muted-foreground text-center text-sm">
        {t("chat.auth.signUp.hasAccount")}{" "}
        <Link
          to={ROUTES.SIGN_IN}
          className="text-primary font-medium hover:underline"
        >
          {t("chat.auth.signIn.submit")}
        </Link>
      </p>
    </form>
  );
}
