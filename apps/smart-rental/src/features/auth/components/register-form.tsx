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

import type { RegisterFormValues } from "~/features/auth/types/register-form";
import { ROUTES } from "~/constants/routes";
import { registerFormSchema } from "~/features/auth/types/register-form";
import { useAuthStore } from "~/stores/use-auth-store";

// Three identical rows — one table, one Controller, keyed by the field name.
const fields = [
  {
    name: "name",
    label: "Họ và tên",
    type: "text",
    placeholder: "Nguyễn Văn A",
    autoComplete: "name",
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "nguyenvana@example.com",
    autoComplete: "email",
  },
  {
    name: "password",
    label: "Mật khẩu",
    type: "password",
    placeholder: "******",
    autoComplete: "new-password",
  },
] as const;

export default function RegisterForm() {
  const navigate = useNavigate();
  const signIn = useAuthStore((s) => s.signIn);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  // The prototype sent a landlord to onboarding after registering; with `role`
  // gone the landlord is the only account there is.
  const onSubmit = form.handleSubmit((values) => {
    signIn(`local-${values.email}`, { name: values.name, email: values.email });
    navigate(ROUTES.ONBOARDING);
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <CardContent>
        <FieldGroup>
          {fields.map(({ name, label, ...input }) => (
            <Controller
              key={name}
              name={name}
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
                  <Input
                    {...field}
                    {...input}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          ))}
        </FieldGroup>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button type="submit" className="w-full">
          Đăng ký
        </Button>
        <div className="text-center text-sm">
          Đã có tài khoản?{" "}
          <Link
            to={ROUTES.AUTH_LOGIN}
            className="text-primary font-medium hover:underline"
          >
            Đăng nhập
          </Link>
        </div>
      </CardFooter>
    </form>
  );
}
