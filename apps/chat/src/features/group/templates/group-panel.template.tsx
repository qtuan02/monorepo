import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, PencilLine, X } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { ChatParticipantRole } from "@monorepo/types/chat-conversation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@monorepo/ui/components/alert-dialog";
import { Button } from "@monorepo/ui/components/button";
import { Field, FieldError } from "@monorepo/ui/components/field";
import { Input } from "@monorepo/ui/components/input";

import type { Conversation } from "~/features/conversation/types/conversation";
import type { RenameGroupFormValues } from "~/features/group/types/rename-group-form";
import { ConversationAvatar } from "~/components/avatar/conversation-avatar";
import { AddGroupMembersDialog } from "~/features/group/components/add-group-members-dialog";
import { GroupActions } from "~/features/group/components/group-actions";
import { GroupMembersSection } from "~/features/group/components/group-members-section";
import { useGroupActions } from "~/features/group/hooks/use-group-actions";
import { createRenameGroupFormSchema } from "~/features/group/types/rename-group-form";
import { useSocketStore } from "~/stores/use-socket-store";

interface GroupHeaderProps {
  name: string;
  canRename: boolean;
  isSubmitting: boolean;
  onRename: (name: string) => void;
}

/** The group's name, editable inline for the owner only (story 46) — no
 * dialog, just a pencil that turns the heading into a field until Enter/blur
 * commits it or Escape cancels. */
function GroupHeaderTitle({
  name,
  canRename,
  isSubmitting,
  onRename,
}: GroupHeaderProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = React.useState(false);
  // Rebuilt on every language switch — see createRenameGroupFormSchema.
  const schema = React.useMemo(() => createRenameGroupFormSchema(t), [t]);
  const form = useForm<RenameGroupFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name },
  });

  if (!canRename) {
    return <p className="text-base font-semibold">{name}</p>;
  }

  const cancel = () => {
    setIsEditing(false);
    form.reset({ name });
  };

  if (!isEditing) {
    return (
      <div className="flex items-center gap-1">
        <p className="text-base font-semibold">{name}</p>
        <Button
          type="button"
          size="icon-sm"
          variant="outline"
          aria-label={t("chat.group.header.renameAria")}
          onClick={() => {
            form.reset({ name });
            setIsEditing(true);
          }}
        >
          <PencilLine className="size-3.5" />
        </Button>
      </div>
    );
  }

  const onSubmit = form.handleSubmit((values) => {
    setIsEditing(false);
    if (values.name !== name) onRename(values.name);
  });

  return (
    <form onSubmit={onSubmit}>
      <Controller
        name="name"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} orientation="horizontal">
            <Input
              {...field}
              id={field.name}
              autoFocus
              disabled={isSubmitting}
              aria-label={t("chat.group.header.nameAria")}
              aria-invalid={fieldState.invalid}
              className="h-8"
              onKeyDown={(event) => {
                if (event.key === "Escape") cancel();
              }}
            />
            <Button
              type="submit"
              size="icon-sm"
              variant="outline"
              aria-label={t("chat.group.header.saveAria")}
              disabled={isSubmitting}
            >
              <Check className="size-3.5" />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              aria-label={t("chat.group.header.cancelAria")}
              onClick={cancel}
            >
              <X className="size-3.5" />
            </Button>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </form>
  );
}

interface GroupPanelTemplateProps {
  conversation: Conversation;
  onLeft: () => void;
}

/** The group half of the conversation details panel — see
 * conversation-details-panel.tsx. */
export default function GroupPanelTemplate({
  conversation,
  onLeft,
}: GroupPanelTemplateProps) {
  const { t } = useTranslation();
  const [isAddMembersOpen, setIsAddMembersOpen] = React.useState(false);
  const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = React.useState(false);
  const onlineUsers = useSocketStore((state) => state.onlineUsers);

  const currentUserRole = conversation.members.find(
    (member) => member.userId === conversation.currentUserId,
  )?.role;
  const isCurrentUserAdmin = currentUserRole === ChatParticipantRole.ADMIN;
  const memberIds = React.useMemo(
    () => new Set(conversation.members.map((member) => member.userId)),
    [conversation.members],
  );
  const onlineCount = conversation.members.filter((member) =>
    onlineUsers.includes(member.userId),
  ).length;

  const {
    isRenameGroupSubmitting,
    isAddMembersSubmitting,
    isLeaveGroupSubmitting,
    removingMemberId,
    onRenameGroup,
    onAddMembers,
    onRemoveMember,
    onLeaveGroup,
  } = useGroupActions({ conversationId: conversation.id, onLeft });

  return (
    <section className="grid gap-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <ConversationAvatar
          title={conversation.title}
          avatarUrl={conversation.avatarUrl}
          className="ring-primary/20 ring-offset-background size-22 ring-4 ring-offset-2"
        />
        <div>
          <GroupHeaderTitle
            name={conversation.title}
            canRename={isCurrentUserAdmin}
            isSubmitting={isRenameGroupSubmitting}
            onRename={onRenameGroup}
          />
          <p className="text-muted-foreground text-xs">
            {t("chat.group.header.memberSummary", {
              count: conversation.members.length,
              online: onlineCount,
            })}
          </p>
        </div>
      </div>

      <GroupActions
        isCurrentUserAdmin={isCurrentUserAdmin}
        isLeaveGroupSubmitting={isLeaveGroupSubmitting}
        onAddMembersClick={() => setIsAddMembersOpen(true)}
        onLeaveGroupClick={() => setIsLeaveConfirmOpen(true)}
      />

      <GroupMembersSection
        members={conversation.members}
        currentUserId={conversation.currentUserId}
        isCurrentUserAdmin={isCurrentUserAdmin}
        removingMemberId={removingMemberId}
        onRemoveMember={onRemoveMember}
      />

      <AddGroupMembersDialog
        open={isAddMembersOpen}
        onOpenChange={setIsAddMembersOpen}
        disabledFriendIds={memberIds}
        isSubmitting={isAddMembersSubmitting}
        onAddMembers={(memberIds) => {
          onAddMembers(memberIds);
          setIsAddMembersOpen(false);
        }}
      />

      <AlertDialog
        open={isLeaveConfirmOpen}
        onOpenChange={setIsLeaveConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("chat.group.leaveConfirm.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("chat.group.leaveConfirm.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("chat.group.leaveConfirm.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setIsLeaveConfirmOpen(false);
                onLeaveGroup();
              }}
            >
              {t("chat.group.leaveConfirm.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
