import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router";

import { Button } from "@monorepo/ui/components/button";
import { CardContent, CardFooter } from "@monorepo/ui/components/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@monorepo/ui/components/field";
import { Input } from "@monorepo/ui/components/input";

import type { SignInFormValues } from "~/features/auth/types/sign-in-form";
import { ROUTES } from "~/constants/routes";
import { signInFormSchema } from "~/features/auth/types/sign-in-form";
import { useAuthStore } from "~/stores/use-auth-store";

export default function SignInForm() {
  const navigate = useNavigate();
  const signIn = useAuthStore((s) => s.signIn);

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInFormSchema),
    // The prototype's prefilled demo credentials — there is no backend, so any
    // pair that passes the schema signs in.
    defaultValues: { email: "admin@gmail.com", password: "admin@123" },
  });

  // A push, as in the prototype: GuestRoute already keeps Back off this screen.
  const onSubmit = form.handleSubmit((values) => {
    signIn(`local-${values.email}`, {
      name: "Admin User",
      email: values.email,
    });
    navigate(ROUTES.HOME);
  });

  return (
    // Gap here, not left to Card's own flex — CardContent/CardFooter are
    // children of this <form>, not of Card directly, so Card's own
    // --card-spacing gap (which only reaches its direct children) never
    // applied between them (C.1 #17).
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-(--card-spacing)"
    >
      <CardContent>
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
                  placeholder="admin@example.com"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor={field.name}>Mật khẩu</FieldLabel>
                  {/* The prototype's dead link — no reset flow exists, so a
                      non-navigating control rather than an <a> pointing nowhere. */}
                  <button
                    type="button"
                    className="text-primary text-sm font-medium hover:underline"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <Input
                  {...field}
                  id={field.name}
                  type="password"
                  autoComplete="current-password"
                  placeholder="******"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
      </CardContent>
      <CardFooter>
        <Button type="submit" className="w-full">
          Đăng nhập
        </Button>
      </CardFooter>
    </form>
  );
}
