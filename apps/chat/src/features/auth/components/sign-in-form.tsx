import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
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
import { ROUTES } from "~/constants/routes";
import { useSignInSuccess } from "~/features/auth/hooks/use-sign-in-success";
import { signInFormSchema } from "~/features/auth/types/sign-in-form";
import { useSignInMutation } from "~/hooks/api/auth";

export default function SignInForm() {
  const handleSuccess = useSignInSuccess();
  const signIn = useSignInMutation({ onSuccess: handleSuccess });

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = form.handleSubmit((values) => signIn.mutate(values));

  return (
    <form
      noValidate
      className="flex w-full max-w-sm flex-col gap-4"
      onSubmit={onSubmit}
    >
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-muted-foreground text-sm">
          Login to your Chat application
        </p>
      </div>

      <FieldGroup>
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
                placeholder="your-username"
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
                autoComplete="current-password"
                placeholder="Enter your password"
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
          {signIn.isPending ? "Signing in..." : "Sign in"}
        </Button>
      </FieldGroup>

      <p className="text-muted-foreground text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link
          to={ROUTES.SIGN_UP}
          className="text-primary font-medium hover:underline"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}
