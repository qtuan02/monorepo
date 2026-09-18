import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { MessageCircle } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
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
import { signUpFormSchema } from "~/features/auth/types/sign-up-form";
import { useSignInMutation, useSignUpMutation } from "~/hooks/api/auth";

type CreatedCredentials = Pick<SignUpFormValues, "username" | "password">;

export default function SignUpForm() {
  const handleSignInSuccess = useSignInSuccess();
  const [createdCredentials, setCreatedCredentials] =
    React.useState<CreatedCredentials | null>(null);

  const signUp = useSignUpMutation();
  const signIn = useSignInMutation({ onSuccess: handleSignInSuccess });

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      username: "",
      password: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await signUp.mutateAsync(values);
    setCreatedCredentials({
      username: values.username,
      password: values.password,
    });
  });

  if (createdCredentials) {
    return (
      <div className="flex w-full max-w-sm flex-col items-center gap-4 text-center">
        <h1 className="text-2xl font-bold">Account created</h1>
        <p className="text-muted-foreground text-sm">
          Your account has been created successfully. You can sign in now.
        </p>
        <Button
          type="button"
          disabled={signIn.isPending}
          onClick={() => signIn.mutate(createdCredentials)}
        >
          {signIn.isPending ? "Signing in..." : "Yes, sign in"}
        </Button>
        {/* A navigation link styled as a button — never `Button` itself, which
            assumes a native <button> (see .agents/rules/architecture-ui-
            primitives.md, "A link that looks like a button"). */}
        <Link
          to={ROUTES.SIGN_IN}
          className={cn(buttonVariants({ variant: "link" }), "h-auto p-0")}
        >
          Go to sign in instead
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
        <span className="text-primary mb-1 inline-flex items-center gap-2">
          <MessageCircle className="size-6" aria-hidden="true" />
          <span className="text-lg font-bold tracking-tight">Chat</span>
        </span>
        <h1 className="text-2xl font-bold">Create account</h1>
        <p className="text-muted-foreground text-sm">
          Create your Chat application account
        </p>
      </div>

      <FieldGroup>
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Email</FieldLabel>
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

        <Controller
          name="firstName"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>First name</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="text"
                autoComplete="given-name"
                placeholder="Tuan"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="lastName"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Last name</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="text"
                autoComplete="family-name"
                placeholder="Huynh"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="username"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Username</FieldLabel>
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
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Password</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="password"
                autoComplete="new-password"
                placeholder="Enter your password"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Button type="submit" disabled={signUp.isPending} className="w-full">
          {signUp.isPending ? "Creating account..." : "Sign up"}
        </Button>
      </FieldGroup>

      <p className="text-muted-foreground text-center text-sm">
        Already have an account?{" "}
        <Link
          to={ROUTES.SIGN_IN}
          className="text-primary font-medium hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
