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
import { Badge } from "@monorepo/ui/components/badge";
import { Button } from "@monorepo/ui/components/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@monorepo/ui/components/item";

import type { ConversationMember } from "~/features/conversation/types/conversation";
import { ConversationAvatar } from "~/components/avatar/conversation-avatar";

interface GroupMembersSectionProps {
  members: ConversationMember[];
  currentUserId: string;
  isCurrentUserAdmin: boolean;
  removingMemberId?: string | null;
  onRemoveMember?: (memberId: string) => void;
}

/** Same `Item` anatomy as `UserItem`/`FriendRequestRow` (story 54); only the
 * group's owner carries a `Badge` — a member wears no label at all (brief
 * §10 row 12: "Owner" is the only tag the mockup ever shows). */
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
      <ItemGroup>
        {members.map((member) => {
          const isSelf = member.userId === currentUserId;
          const isOwner = member.role === ChatParticipantRole.ADMIN;
          const isRemovable = isCurrentUserAdmin && !isSelf && !isOwner;
          const isRemoving = removingMemberId === member.userId;

          return (
            <Item key={member.userId} size="sm">
              <ItemMedia>
                <ConversationAvatar
                  title={member.displayName}
                  avatarUrl={member.avatarUrl}
                />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>
                  {member.displayName}
                  {isSelf && (
                    <span className="text-muted-foreground font-normal">
                      (You)
                    </span>
                  )}
                  {isOwner && <Badge variant="secondary">Owner</Badge>}
                </ItemTitle>
              </ItemContent>
              {isRemovable && (
                <ItemActions>
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
                </ItemActions>
              )}
            </Item>
          );
        })}
      </ItemGroup>

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
