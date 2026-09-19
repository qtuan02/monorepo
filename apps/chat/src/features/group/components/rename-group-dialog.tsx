import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

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

import type { RenameGroupFormValues } from "~/features/group/types/rename-group-form";
import { renameGroupFormSchema } from "~/features/group/types/rename-group-form";

interface RenameGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  isSubmitting: boolean;
  onRename: (name: string) => void;
}

export function RenameGroupDialog({
  open,
  onOpenChange,
  name,
  isSubmitting,
  onRename,
}: RenameGroupDialogProps) {
  const form = useForm<RenameGroupFormValues>({
    resolver: zodResolver(renameGroupFormSchema),
    defaultValues: { name },
  });

  React.useEffect(() => {
    if (open) form.reset({ name });
  }, [open, name, form]);

  const onSubmit = form.handleSubmit((values) => onRename(values.name));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename group</DialogTitle>
          <DialogDescription>
            Choose a new name for this group conversation.
          </DialogDescription>
        </DialogHeader>

        <form id="rename-group-form" noValidate onSubmit={onSubmit}>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Group name</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    disabled={isSubmitting}
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
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="rename-group-form"
            disabled={isSubmitting || !form.formState.isValid}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
