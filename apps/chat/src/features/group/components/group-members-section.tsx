import * as React from "react";
import { Loader2, UserMinus } from "lucide-react";

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

import type { ConversationMember } from "~/features/conversation/types/conversation";
import { ConversationAvatar } from "~/components/avatar/conversation-avatar";

const ROLE_LABEL: Record<ChatParticipantRole, string> = {
  [ChatParticipantRole.ADMIN]: "Admin",
  [ChatParticipantRole.MEMBER]: "Member",
};

interface GroupMembersSectionProps {
  members: ConversationMember[];
  currentUserId: string;
  isCurrentUserAdmin: boolean;
  removingMemberId?: string | null;
  onRemoveMember?: (memberId: string) => void;
}

export function GroupMembersSection({
  members,
  currentUserId,
  isCurrentUserAdmin,
  removingMemberId,
  onRemoveMember,
}: GroupMembersSectionProps) {
  const [confirmingMemberId, setConfirmingMemberId] = React.useState<
    string | null
  >(null);
  const confirmingMember = members.find(
    (member) => member.userId === confirmingMemberId,
  );

  return (
    <div className="grid gap-2">
      <p className="text-muted-foreground px-1 text-xs font-semibold uppercase tracking-wide">
        Members · {members.length}
      </p>
      <ul className="bg-muted/40 grid gap-0.5 rounded-xl p-1">
        {members.map((member) => {
          const isSelf = member.userId === currentUserId;
          const isRemovable =
            isCurrentUserAdmin &&
            !isSelf &&
            member.role !== ChatParticipantRole.ADMIN;
          const isRemoving = removingMemberId === member.userId;

          return (
            <li
              key={member.userId}
              className="flex items-center gap-2.5 rounded-lg px-2 py-1.5"
            >
              <ConversationAvatar
                title={member.displayName}
                avatarUrl={member.avatarUrl}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium leading-5">
                  {member.displayName}
                  {isSelf && (
                    <span className="text-muted-foreground"> (You)</span>
                  )}
                </p>
                <p className="text-muted-foreground truncate text-xs leading-4">
                  {ROLE_LABEL[member.role]}
                </p>
              </div>
              {isRemovable && (
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive rounded-full"
                  onClick={() => setConfirmingMemberId(member.userId)}
                  disabled={isRemoving}
                  aria-label={`Remove ${member.displayName} from group`}
                >
                  {isRemoving ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <UserMinus className="size-4" />
                  )}
                </Button>
              )}
            </li>
          );
        })}
      </ul>

      <AlertDialog
        open={!!confirmingMember}
        onOpenChange={(open) => {
          if (!open) setConfirmingMemberId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Remove {confirmingMember?.displayName}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              They will no longer see this group's messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (confirmingMemberId) onRemoveMember?.(confirmingMemberId);
                setConfirmingMemberId(null);
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
