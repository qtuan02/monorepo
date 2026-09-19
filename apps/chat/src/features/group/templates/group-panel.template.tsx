import * as React from "react";

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
import { AddGroupMembersDialog } from "~/features/group/components/add-group-members-dialog";
import { GroupActions } from "~/features/group/components/group-actions";
import { GroupMembersSection } from "~/features/group/components/group-members-section";
import { RenameGroupDialog } from "~/features/group/components/rename-group-dialog";
import { useGroupActions } from "~/features/group/hooks/use-group-actions";

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
  const [isRenameOpen, setIsRenameOpen] = React.useState(false);
  const [isAddMembersOpen, setIsAddMembersOpen] = React.useState(false);
  const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = React.useState(false);

  const currentUserRole = conversation.members.find(
    (member) => member.userId === conversation.currentUserId,
  )?.role;
  const isCurrentUserAdmin = currentUserRole === ChatParticipantRole.ADMIN;
  const memberIds = React.useMemo(
    () => new Set(conversation.members.map((member) => member.userId)),
    [conversation.members],
  );

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
    <section className="grid gap-3">
      <GroupActions
        isLeaveGroupSubmitting={isLeaveGroupSubmitting}
        onAddMembersClick={() => setIsAddMembersOpen(true)}
        onLeaveGroupClick={() => setIsLeaveConfirmOpen(true)}
        onRenameGroupClick={() => setIsRenameOpen(true)}
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
        name={conversation.title}
        isSubmitting={isRenameGroupSubmitting}
        onRename={(name) => {
          onRenameGroup(name);
          setIsRenameOpen(false);
        }}
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
