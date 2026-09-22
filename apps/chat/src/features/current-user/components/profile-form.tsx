import type { Control, FieldPath } from "react-hook-form";
import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { PencilLine } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";

import type { ChatUserProfile } from "@monorepo/types/chat-user";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@monorepo/ui/components/avatar";
import { Button } from "@monorepo/ui/components/button";
import {
  Field,
  FieldError,
  FieldLabel,
  FieldTitle,
} from "@monorepo/ui/components/field";
import { Input } from "@monorepo/ui/components/input";
import { Textarea } from "@monorepo/ui/components/textarea";
import { cn } from "@monorepo/ui/utils/cn";

import type { ProfileFormValues } from "~/features/current-user/types/profile-form";
import { ChangePasswordDialog } from "~/features/current-user/components/change-password-dialog";
import { createProfileFormSchema } from "~/features/current-user/types/profile-form";
import { useUpdateProfileMutation } from "~/hooks/api/user";
import { getDisplayName, getInitials } from "~/utils/display";

/** `/profile?edit=1` opens straight into edit mode — the Rail menu's "Edit
 * profile" links there, and the URL is what makes Back leave edit mode. */
const EDIT_PARAM = "edit";

function toDefaultValues(profile: ChatUserProfile): ProfileFormValues {
  return {
    username: profile.username,
    email: profile.email ?? "",
    firstName: profile.firstName,
    lastName: profile.lastName,
    phone: profile.phone ?? "",
    bio: profile.bio ?? "",
  };
}

interface ProfileFieldProps {
  control: Control<ProfileFormValues>;
  name: FieldPath<ProfileFormValues>;
  label: string;
  editing: boolean;
  /** What view mode shows — the saved profile, never the form's draft. */
  value: string | null | undefined;
  type?: "text" | "email" | "tel";
  autoComplete?: string;
  multiline?: boolean;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

/**
 * One row in both modes. The read-only value is boxed exactly like the input
 * it becomes (same height, padding and a transparent border), so toggling
 * view ↔ edit swaps text for a control without anything on the page moving.
 */
function ProfileField({
  control,
  name,
  label,
  editing,
  value,
  type = "text",
  autoComplete,
  multiline = false,
  disabled = false,
  required = false,
  className,
}: ProfileFieldProps) {
  const { t } = useTranslation();
  const boxClassName = multiline ? "min-h-24 py-2" : "min-h-9 py-1";

  if (!editing) {
    return (
      <Field className={cn("gap-1.5", className)}>
        <FieldTitle>{label}</FieldTitle>
        <p
          className={cn(
            "bg-muted/40 rounded-md border border-transparent px-2.5 text-sm whitespace-pre-wrap",
            boxClassName,
            !multiline && "flex items-center",
          )}
        >
          {value || (
            <span className="text-muted-foreground">
              {t("chat.profile.form.notProvided")}
            </span>
          )}
        </p>
      </Field>
    );
  }

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field
          className={cn("gap-1.5", className)}
          data-invalid={fieldState.invalid}
        >
          <FieldLabel htmlFor={field.name}>
            {label}
            {required && (
              <span aria-hidden="true" className="text-destructive">
                *
              </span>
            )}
          </FieldLabel>
          {multiline ? (
            <Textarea
              {...field}
              id={field.name}
              className={boxClassName}
              disabled={disabled}
              aria-invalid={fieldState.invalid}
            />
          ) : (
            <Input
              {...field}
              id={field.name}
              type={type}
              autoComplete={autoComplete}
              disabled={disabled}
              aria-invalid={fieldState.invalid}
            />
          )}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

/**
 * The profile screen's body — one surface with a view state and an edit
 * state, switched on `?edit`, in place of the modal it replaced. Only the
 * fields' controls change between the two; the cover, avatar, name row and
 * grid stay put.
 */
export function ProfileForm({ profile }: { profile: ChatUserProfile }) {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const editing = searchParams.has(EDIT_PARAM);
  const updateProfile = useUpdateProfileMutation();

  // Rebuilt on every language switch — see createProfileFormSchema.
  const schema = React.useMemo(() => createProfileFormSchema(t), [t]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(schema),
    defaultValues: toDefaultValues(profile),
  });

  const startEditing = () => {
    form.reset(toDefaultValues(profile));
    setSearchParams({ [EDIT_PARAM]: "1" }, { replace: true });
  };
  const stopEditing = () => setSearchParams({}, { replace: true });

  // Call-site callback, not a hook option: the hook spreads options after its
  // own onSuccess, so passing one there would drop its setQueryData.
  const onSubmit = form.handleSubmit((values) =>
    updateProfile.mutate(values, { onSuccess: stopEditing }),
  );

  const displayName = getDisplayName(profile);
  const pending = updateProfile.isPending;

  return (
    <form
      id="profile-form"
      noValidate
      onSubmit={onSubmit}
      className="flex flex-col"
    >
      <div className="from-primary/30 via-primary/10 h-28 shrink-0 bg-gradient-to-br to-transparent md:h-36" />

      <div className="flex flex-col gap-6 px-4 pb-6 md:px-8">
        <header className="-mt-12 flex flex-col gap-4 md:-mt-14 md:flex-row md:items-end md:justify-between">
          <div className="flex min-w-0 items-end gap-4">
            <Avatar className="ring-card size-24 shrink-0 ring-4 md:size-28">
              {profile.avatarUrl && (
                <AvatarImage src={profile.avatarUrl} alt="" />
              )}
              <AvatarFallback className="text-2xl font-semibold">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 pb-1">
              <h1 className="truncate text-2xl font-semibold">{displayName}</h1>
              <p className="text-muted-foreground truncate text-sm">
                @{profile.username}
              </p>
            </div>
          </div>

          <div className="flex gap-2 md:pb-1">
            {editing ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  disabled={pending}
                  onClick={stopEditing}
                >
                  {t("chat.profile.form.cancel")}
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending
                    ? t("chat.profile.form.saving")
                    : t("chat.profile.form.save")}
                </Button>
              </>
            ) : (
              <>
                <ChangePasswordDialog />
                <Button type="button" variant="outline" onClick={startEditing}>
                  <PencilLine className="size-4" />
                  {t("chat.profile.editProfile")}
                </Button>
              </>
            )}
          </div>
        </header>

        <section className="grid gap-x-6 gap-y-4 md:grid-cols-2">
          <ProfileField
            control={form.control}
            name="firstName"
            label={t("chat.profile.field.firstName")}
            editing={editing}
            value={profile.firstName}
            autoComplete="given-name"
            disabled={pending}
            required
          />
          <ProfileField
            control={form.control}
            name="lastName"
            label={t("chat.profile.field.lastName")}
            editing={editing}
            value={profile.lastName}
            autoComplete="family-name"
            disabled={pending}
            required
          />
          <ProfileField
            control={form.control}
            name="username"
            label={t("chat.profile.field.username")}
            editing={editing}
            value={profile.username}
            autoComplete="username"
            disabled={pending}
            required
          />
          <ProfileField
            control={form.control}
            name="email"
            label={t("chat.profile.field.email")}
            editing={editing}
            value={profile.email}
            type="email"
            autoComplete="email"
            disabled={pending}
            required
          />
          <ProfileField
            control={form.control}
            name="phone"
            label={t("chat.profile.field.phone")}
            editing={editing}
            value={profile.phone}
            type="tel"
            autoComplete="tel"
            disabled={pending}
          />
          <ProfileField
            control={form.control}
            name="bio"
            label={t("chat.profile.field.bio")}
            editing={editing}
            value={profile.bio}
            multiline
            disabled={pending}
            className="md:col-span-2"
          />
        </section>
      </div>
    </form>
  );
}
