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
import { FieldGroup } from "@monorepo/ui/components/field";

import type { AddMembersFormValues } from "~/features/group/types/add-members-form";
import { GroupMemberPicker } from "~/features/group/components/group-member-picker";
import { addMembersFormSchema } from "~/features/group/types/add-members-form";

interface AddGroupMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disabledFriendIds: ReadonlySet<string>;
  isSubmitting: boolean;
  onAddMembers: (memberIds: string[]) => void;
}

export function AddGroupMembersDialog({
  open,
  onOpenChange,
  disabledFriendIds,
  isSubmitting,
  onAddMembers,
}: AddGroupMembersDialogProps) {
  const form = useForm<AddMembersFormValues>({
    resolver: zodResolver(addMembersFormSchema),
    defaultValues: { memberIds: [] },
    mode: "onChange",
  });

  const onSubmit = form.handleSubmit((values) => {
    onAddMembers([...new Set(values.memberIds)]);
    form.reset({ memberIds: [] });
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) form.reset({ memberIds: [] });
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Add members</DialogTitle>
          <DialogDescription>
            Pick friends who aren't already in this group.
          </DialogDescription>
        </DialogHeader>

        <form id="add-group-members-form" noValidate onSubmit={onSubmit}>
          <FieldGroup>
            <Controller
              name="memberIds"
              control={form.control}
              render={({ field, fieldState }) => (
                <GroupMemberPicker
                  selectedFriendIds={field.value}
                  onChange={field.onChange}
                  disabledFriendIds={disabledFriendIds}
                  error={fieldState.error?.message}
                />
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
            form="add-group-members-form"
            disabled={isSubmitting || !form.formState.isValid}
          >
            {isSubmitting ? "Adding..." : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
