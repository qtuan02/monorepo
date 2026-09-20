import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";

import type { ChatCreateGroupParams } from "@monorepo/types/chat-conversation";
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

import { GroupMemberPicker } from "~/features/group/components/group-member-picker";
import { useCreateGroupDialog } from "~/features/group/hooks/use-create-group-dialog";
import { useCreateGroupMutation } from "~/hooks/api/conversation";

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (conversationId: string) => void;
}

export function CreateGroupDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateGroupDialogProps) {
  const { t } = useTranslation();
  const { form, selectedMemberIds } = useCreateGroupDialog({ isOpen: open });
  const createGroup = useCreateGroupMutation();

  const onSubmit = form.handleSubmit((values) => {
    const payload: ChatCreateGroupParams = {
      type: "GROUP",
      name: values.name,
      memberIds: [...new Set(values.memberIds)],
    };
    createGroup.mutate(payload, {
      onSuccess: (conversation) => {
        onOpenChange(false);
        onCreated(conversation.id);
      },
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("chat.group.create.title")}</DialogTitle>
          <DialogDescription>
            {t("chat.group.create.description")}
          </DialogDescription>
        </DialogHeader>

        <form
          id="create-group-form"
          className="grid gap-4"
          noValidate
          onSubmit={onSubmit}
        >
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    {t("chat.group.create.nameLabel")}
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    placeholder={t("chat.group.create.namePlaceholder")}
                    disabled={createGroup.isPending}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="memberIds"
              control={form.control}
              render={({ field, fieldState }) => (
                <GroupMemberPicker
                  selectedFriendIds={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                />
              )}
            />
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createGroup.isPending}
          >
            {t("chat.group.create.cancel")}
          </Button>
          <Button
            type="submit"
            form="create-group-form"
            disabled={
              createGroup.isPending ||
              !form.formState.isValid ||
              selectedMemberIds.length === 0
            }
          >
            {createGroup.isPending
              ? t("chat.group.create.submitting")
              : selectedMemberIds.length === 0
                ? t("chat.group.create.submit")
                : t("chat.group.create.submitWithCount", {
                    count: selectedMemberIds.length,
                  })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
