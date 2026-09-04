import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LockKeyhole, UserRound } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { Button } from "@monorepo/ui/components/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@monorepo/ui/components/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@monorepo/ui/components/input-group";

import type { SignInFormValues } from "~/features/auth/types/sign-in-form";
import { ROUTES } from "~/constants/routes";
import { signInFormSchema } from "~/features/auth/types/sign-in-form";
import { useAuthStore } from "~/stores/use-auth-store";

export default function SignInForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setToken = useAuthStore((s) => s.setToken);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInFormSchema),
    // Always controlled from the first render — never `undefined`.
    defaultValues: { username: "", password: "" },
  });

  // No backend to authenticate against — passing schema validation is what
  // "signs in" here.
  const onSubmit = form.handleSubmit((values) => {
    setToken(`local-${values.username}`);
    navigate(ROUTES.HOME, { replace: true });
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup className="gap-5">
        <Controller
          name="username"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="gap-2">
              <FieldLabel htmlFor={field.name}>
                {t("auth.signIn.username")}
              </FieldLabel>
              <InputGroup className="h-10">
                <InputGroupAddon>
                  <UserRound />
                </InputGroupAddon>
                <InputGroupInput
                  {...field}
                  id={field.name}
                  autoComplete="username"
                  aria-invalid={fieldState.invalid}
                />
              </InputGroup>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="gap-2">
              <FieldLabel htmlFor={field.name}>
                {t("auth.signIn.password")}
              </FieldLabel>
              <InputGroup className="h-10">
                <InputGroupAddon>
                  <LockKeyhole />
                </InputGroupAddon>
                <InputGroupInput
                  {...field}
                  id={field.name}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  aria-invalid={fieldState.invalid}
                />
                <InputGroupAddon align="inline-end">
                  {/* An icon-only control, so the accessible name comes from
                      aria-label — and it flips with the state, which is what a
                      screen reader announces on toggle. */}
                  <InputGroupButton
                    size="icon-xs"
                    aria-label={t(
                      showPassword
                        ? "auth.signIn.hidePassword"
                        : "auth.signIn.showPassword",
                    )}
                    onClick={() => setShowPassword((visible) => !visible)}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Button type="submit" className="mt-1 h-10">
          {t("auth.signIn.submit")}
        </Button>
      </FieldGroup>
    </form>
  );
}
