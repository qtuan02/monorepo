import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";

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
  const setToken = useAuthStore((s) => s.setToken);

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInFormSchema),
    // The prototype's prefilled demo credentials — there is no backend, so any
    // pair that passes the schema signs in.
    defaultValues: { email: "admin@gmail.com", password: "admin@123" },
  });

  const onSubmit = form.handleSubmit((values) => {
    setToken(`local-${values.email}`);
    navigate(ROUTES.HOME, { replace: true });
  });

  return (
    <form onSubmit={onSubmit} noValidate>
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
                  {/* The prototype's dead link, kept as-is: no reset flow exists. */}
                  <Link
                    to="#"
                    className="text-primary text-sm font-medium hover:underline"
                  >
                    Quên mật khẩu?
                  </Link>
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
      <CardFooter className="flex flex-col gap-4">
        <Button type="submit" className="w-full">
          Đăng nhập
        </Button>
        <div className="text-center text-sm">
          Chưa có tài khoản?{" "}
          <Link
            to={ROUTES.AUTH_REGISTER}
            className="text-primary font-medium hover:underline"
          >
            Đăng ký ngay
          </Link>
        </div>
      </CardFooter>
    </form>
  );
}
