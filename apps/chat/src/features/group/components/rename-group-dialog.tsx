import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Button } from "@monorepo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@monorepo/ui/components/dialog";
import { Field, FieldError, FieldLabel } from "@monorepo/ui/components/field";
import { Input } from "@monorepo/ui/components/input";

import type { RenameGroupFormValues } from "~/features/group/types/rename-group-form";
import { createRenameGroupFormSchema } from "~/features/group/types/rename-group-form";

interface RenameGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  isSubmitting: boolean;
  onRename: (name: string) => void;
}

/** The group's name, editable through a modal (story 46) — opened from the
 * action row's "Rename" button (see group-actions.tsx), not inline on the
 * title any more. */
export function RenameGroupDialog({
  open,
  onOpenChange,
  currentName,
  isSubmitting,
  onRename,
}: RenameGroupDialogProps) {
  const { t } = useTranslation();
  // Rebuilt on every language switch — see createRenameGroupFormSchema.
  const schema = React.useMemo(() => createRenameGroupFormSchema(t), [t]);
  const form = useForm<RenameGroupFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: currentName },
    mode: "onChange",
  });

  // Fresh on every open, in case a previous edit was cancelled or the name
  // changed elsewhere since — never on close, so the field doesn't flash
  // empty during the closing animation.
  React.useEffect(() => {
    if (open) form.reset({ name: currentName });
  }, [form, open, currentName]);

  const onSubmit = form.handleSubmit((values) => {
    if (values.name !== currentName) onRename(values.name);
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("chat.group.rename.title")}</DialogTitle>
        </DialogHeader>

        <form id="rename-group-form" noValidate onSubmit={onSubmit}>
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  {t("chat.group.rename.nameLabel")}
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  autoFocus
                  disabled={isSubmitting}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            {t("chat.group.rename.cancel")}
          </Button>
          <Button
            type="submit"
            form="rename-group-form"
            disabled={isSubmitting || !form.formState.isValid}
          >
            {isSubmitting
              ? t("chat.group.rename.submitting")
              : t("chat.group.rename.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
