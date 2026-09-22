import * as React from "react";
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

import type { Conversation } from "~/features/conversation/types/conversation";
import { ConversationAvatar } from "~/components/avatar/conversation-avatar";
import { AddGroupMembersDialog } from "~/features/group/components/add-group-members-dialog";
import { GroupActions } from "~/features/group/components/group-actions";
import { GroupMembersSection } from "~/features/group/components/group-members-section";
import { RenameGroupDialog } from "~/features/group/components/rename-group-dialog";
import { useGroupActions } from "~/features/group/hooks/use-group-actions";
import { useSocketStore } from "~/stores/use-socket-store";

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
  const [isRenameOpen, setIsRenameOpen] = React.useState(false);
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
        <div className="w-full min-w-0">
          <p className="w-full truncate text-base font-semibold">
            {conversation.title}
          </p>
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
        isRenameGroupSubmitting={isRenameGroupSubmitting}
        isLeaveGroupSubmitting={isLeaveGroupSubmitting}
        onRenameClick={() => setIsRenameOpen(true)}
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

      <RenameGroupDialog
        open={isRenameOpen}
        onOpenChange={setIsRenameOpen}
        currentName={conversation.title}
        isSubmitting={isRenameGroupSubmitting}
        onRename={onRenameGroup}
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
