import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import type { ChatUserProfile } from "@monorepo/types/chat-user";
import { Button } from "@monorepo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@monorepo/ui/components/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@monorepo/ui/components/field";
import { Input } from "@monorepo/ui/components/input";
import { Textarea } from "@monorepo/ui/components/textarea";

import type { ProfileFormValues } from "~/features/current-user/types/profile-form";
import { profileFormSchema } from "~/features/current-user/types/profile-form";
import { useUpdateProfileMutation } from "~/hooks/api/user";

interface ProfileEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: ChatUserProfile;
}

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

export function ProfileEditDialog({
  open,
  onOpenChange,
  profile,
}: ProfileEditDialogProps) {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: toDefaultValues(profile),
  });
  const updateProfile = useUpdateProfileMutation({
    onSuccess: () => onOpenChange(false),
  });

  React.useEffect(() => {
    if (open) form.reset(toDefaultValues(profile));
  }, [open, profile, form]);

  const onSubmit = form.handleSubmit((values) => updateProfile.mutate(values));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Update your personal profile details.
          </DialogDescription>
        </DialogHeader>

        <form
          id="profile-edit-form"
          className="grid gap-4"
          noValidate
          onSubmit={onSubmit}
        >
          <FieldGroup>
            <Controller
              name="firstName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>First name</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    disabled={updateProfile.isPending}
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
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Last name</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    disabled={updateProfile.isPending}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
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
                    disabled={updateProfile.isPending}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

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
                    disabled={updateProfile.isPending}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="phone"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Phone</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    disabled={updateProfile.isPending}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="bio"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Bio</FieldLabel>
                  <Textarea
                    {...field}
                    id={field.name}
                    rows={3}
                    disabled={updateProfile.isPending}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={updateProfile.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="profile-edit-form"
            disabled={updateProfile.isPending || !form.formState.isValid}
          >
            {updateProfile.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
