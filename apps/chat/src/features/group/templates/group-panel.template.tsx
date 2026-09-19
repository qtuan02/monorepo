import * as React from "react";
import { Check, PencilLine, X } from "lucide-react";

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
import { Input } from "@monorepo/ui/components/input";

import type { Conversation } from "~/features/conversation/types/conversation";
import { ConversationAvatar } from "~/components/avatar/conversation-avatar";
import { AddGroupMembersDialog } from "~/features/group/components/add-group-members-dialog";
import { GroupActions } from "~/features/group/components/group-actions";
import { GroupMembersSection } from "~/features/group/components/group-members-section";
import { useGroupActions } from "~/features/group/hooks/use-group-actions";
import { renameGroupFormSchema } from "~/features/group/types/rename-group-form";
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
  const [isEditing, setIsEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(name);
  const [error, setError] = React.useState<string>();

  if (!canRename) {
    return <p className="text-base font-semibold">{name}</p>;
  }

  if (!isEditing) {
    return (
      <div className="flex items-center gap-1">
        <p className="text-base font-semibold">{name}</p>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label="Rename group"
          onClick={() => {
            setDraft(name);
            setError(undefined);
            setIsEditing(true);
          }}
        >
          <PencilLine className="size-3.5" />
        </Button>
      </div>
    );
  }

  const commit = () => {
    const result = renameGroupFormSchema.safeParse({ name: draft });
    if (!result.success) {
      setError(result.error.issues[0]?.message);
      return;
    }
    setError(undefined);
    setIsEditing(false);
    if (result.data.name !== name) onRename(result.data.name);
  };

  const cancel = () => {
    setIsEditing(false);
    setError(undefined);
    setDraft(name);
  };

  return (
    <form
      className="flex flex-col gap-1"
      onSubmit={(event) => {
        event.preventDefault();
        commit();
      }}
    >
      <div className="flex items-center gap-1">
        <Input
          autoFocus
          value={draft}
          disabled={isSubmitting}
          aria-label="Group name"
          className="h-8"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") cancel();
          }}
        />
        <Button
          type="submit"
          size="icon-sm"
          variant="ghost"
          aria-label="Save group name"
          disabled={isSubmitting}
        >
          <Check className="size-3.5" />
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label="Cancel rename"
          onClick={cancel}
        >
          <X className="size-3.5" />
        </Button>
      </div>
      {error && <p className="text-destructive text-xs">{error}</p>}
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
            {conversation.members.length} members · {onlineCount} online
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
            <AlertDialogTitle>Leave this group?</AlertDialogTitle>
            <AlertDialogDescription>
              You will stop receiving its messages. You can only rejoin if
              someone adds you back.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setIsLeaveConfirmOpen(false);
                onLeaveGroup();
              }}
            >
              Leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
