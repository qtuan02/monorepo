import type { Control, FieldPath } from "react-hook-form";
import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Button } from "@monorepo/ui/components/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
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
 * in profile-form.tsx for the sibling this mirrors. */
function PasswordField({
  control,
  name,
  label,
  autoComplete,
  disabled,
}: PasswordFieldProps) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          <Input
            {...field}
            id={field.name}
            type="password"
            autoComplete={autoComplete}
            disabled={disabled}
            aria-invalid={fieldState.invalid}
          />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

/**
 * A second, independent form beside `ProfileForm` — a password change has no
 * view/edit toggle of its own and never prefills from the current profile.
 */
export function ChangePasswordForm() {
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
      { onSuccess: () => form.reset(DEFAULT_VALUES) },
    );
  });

  return (
    <FieldSet className="border-border gap-4 border-t px-4 pt-6 pb-6 md:px-8">
      <FieldLegend>{t("chat.profile.changePassword.title")}</FieldLegend>
      <form
        id="change-password-form"
        noValidate
        onSubmit={onSubmit}
        className="flex max-w-sm flex-col gap-4"
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
        <Button type="submit" disabled={pending} className="self-start">
          {pending
            ? t("chat.profile.changePassword.saving")
            : t("chat.profile.changePassword.save")}
        </Button>
      </form>
    </FieldSet>
  );
}
