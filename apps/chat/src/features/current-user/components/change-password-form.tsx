import type { Control, FieldPath } from "react-hook-form";
import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Button } from "@monorepo/ui/components/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@monorepo/ui/components/field";
import { Input } from "@monorepo/ui/components/input";

import type { ChangePasswordFormValues } from "~/features/current-user/types/change-password-form";
import { createChangePasswordFormSchema } from "~/features/current-user/types/change-password-form";
import { useChangePasswordMutation } from "~/hooks/api/user";

const DEFAULT_VALUES: ChangePasswordFormValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

interface PasswordFieldProps {
  control: Control<ChangePasswordFormValues>;
  name: FieldPath<ChangePasswordFormValues>;
  label: string;
  autoComplete: string;
  disabled: boolean;
}

/** The three fields differ only in name/label/autoComplete — see `ProfileField`
 * in profile-form.tsx for the sibling this mirrors. All three are required,
 * so the label always carries the asterisk. */
function PasswordField({
  control,
  name,
  label,
  autoComplete,
  disabled,
}: PasswordFieldProps) {
  const { t } = useTranslation();
  const [visible, setVisible] = React.useState(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field className="gap-1.5" data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>
            {label}
            <span aria-hidden="true" className="text-destructive">
              *
            </span>
          </FieldLabel>
          <div className="relative">
            <Input
              {...field}
              id={field.name}
              type={visible ? "text" : "password"}
              autoComplete={autoComplete}
              disabled={disabled}
              aria-invalid={fieldState.invalid}
              className="pr-9"
            />
            <button
              type="button"
              tabIndex={-1}
              disabled={disabled}
              onClick={() => setVisible((prev) => !prev)}
              aria-label={
                visible
                  ? t("chat.profile.changePassword.hidePassword")
                  : t("chat.profile.changePassword.showPassword")
              }
              className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center px-2.5 disabled:pointer-events-none disabled:opacity-50"
            >
              {visible ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

/**
 * A second, independent form from `ProfileForm` — a password change has no
 * view/edit toggle of its own and never prefills from the current profile.
 * Rendered inside `ChangePasswordDialog`'s `DialogContent`, so it owns no
 * heading of its own; `onSuccess` is how the dialog closes itself.
 */
export function ChangePasswordForm({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useTranslation();
  const changePassword = useChangePasswordMutation();

  // Rebuilt on every language switch — see createProfileFormSchema.
  const schema = React.useMemo(() => createChangePasswordFormSchema(t), [t]);

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULT_VALUES,
  });

  const pending = changePassword.isPending;

  // confirmPassword only drives the .refine() check — the service takes the
  // two fields chat-socket's ChangePasswordRequest actually declares.
  const onSubmit = form.handleSubmit(({ currentPassword, newPassword }) => {
    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          form.reset(DEFAULT_VALUES);
          onSuccess();
        },
      },
    );
  });

  return (
    <form
      id="change-password-form"
      noValidate
      onSubmit={onSubmit}
      className="flex flex-col gap-4"
    >
      <FieldGroup>
        <PasswordField
          control={form.control}
          name="currentPassword"
          label={t("chat.profile.changePassword.field.currentPassword")}
          autoComplete="current-password"
          disabled={pending}
        />
        <PasswordField
          control={form.control}
          name="newPassword"
          label={t("chat.profile.changePassword.field.newPassword")}
          autoComplete="new-password"
          disabled={pending}
        />
        <PasswordField
          control={form.control}
          name="confirmPassword"
          label={t("chat.profile.changePassword.field.confirmPassword")}
          autoComplete="new-password"
          disabled={pending}
        />
      </FieldGroup>
      <Button type="submit" disabled={pending} className="self-end">
        {pending
          ? t("chat.profile.changePassword.saving")
          : t("chat.profile.changePassword.save")}
      </Button>
    </form>
  );
}
