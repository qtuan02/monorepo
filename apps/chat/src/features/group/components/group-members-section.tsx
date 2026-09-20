import * as React from "react";
import { Loader2, UserMinus } from "lucide-react";
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
import { Badge } from "@monorepo/ui/components/badge";
import { Button } from "@monorepo/ui/components/button";
import { Item, ItemActions, ItemGroup } from "@monorepo/ui/components/item";

import type { ConversationMember } from "~/features/conversation/types/conversation";
import { ConversationAvatar } from "~/components/avatar/conversation-avatar";
import { UserDetailDialog } from "~/components/user-detail-dialog";

interface GroupMembersSectionProps {
  members: ConversationMember[];
  currentUserId: string;
  isCurrentUserAdmin: boolean;
  removingMemberId?: string | null;
  onRemoveMember?: (memberId: string) => void;
}

/** Same `Item` anatomy as `UserItem` (story 54) — avatar + name open the
 * member's `UserDetailDialog`, one dialog for the whole list keyed by who was
 * tapped. Only the group's owner carries a `Badge` — a member wears no label
 * at all (brief §10 row 12: "Owner" is the only tag the mockup ever shows). */
export function GroupMembersSection({
  members,
  currentUserId,
  isCurrentUserAdmin,
  removingMemberId,
  onRemoveMember,
}: GroupMembersSectionProps) {
  const { t } = useTranslation();
  const [confirmingMemberId, setConfirmingMemberId] = React.useState<
    string | null
  >(null);
  const [viewingMemberId, setViewingMemberId] = React.useState<string | null>(
    null,
  );
  const confirmingMember = members.find(
    (member) => member.userId === confirmingMemberId,
  );

  return (
    <div className="grid gap-2">
      <p className="text-muted-foreground px-1 text-xs font-semibold uppercase tracking-wide">
        {t("chat.group.membersSection.title", { count: members.length })}
      </p>
      <ItemGroup>
        {members.map((member) => {
          const isSelf = member.userId === currentUserId;
          const isOwner = member.role === ChatParticipantRole.ADMIN;
          const isRemovable = isCurrentUserAdmin && !isSelf && !isOwner;
          const isRemoving = removingMemberId === member.userId;

          return (
            <Item key={member.userId} size="sm">
              <button
                type="button"
                className="focus-visible:ring-ring/50 -m-1 flex min-w-0 flex-1 items-center gap-2.5 rounded-md p-1 text-left outline-none focus-visible:ring-[3px]"
                onClick={() => setViewingMemberId(member.userId)}
              >
                <ConversationAvatar
                  title={member.displayName}
                  avatarUrl={member.avatarUrl}
                />
                <span className="flex min-w-0 flex-1 items-center gap-2 text-sm font-medium">
                  <span className="truncate">{member.displayName}</span>
                  {isSelf && (
                    <span className="text-muted-foreground font-normal">
                      {t("chat.group.membersSection.you")}
                    </span>
                  )}
                  {isOwner && (
                    <Badge variant="secondary">
                      {t("chat.group.membersSection.owner")}
                    </Badge>
                  )}
                </span>
              </button>
              {isRemovable && (
                <ItemActions>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="outline"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive rounded-full"
                    onClick={() => setConfirmingMemberId(member.userId)}
                    disabled={isRemoving}
                    aria-label={t("chat.group.membersSection.removeAria", {
                      name: member.displayName,
                    })}
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

      {viewingMemberId && (
        <UserDetailDialog
          userId={viewingMemberId}
          open
          onOpenChange={(open) => {
            if (!open) setViewingMemberId(null);
          }}
        />
      )}

      <AlertDialog
        open={!!confirmingMember}
        onOpenChange={(open) => {
          if (!open) setConfirmingMemberId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("chat.group.membersSection.confirmTitle", {
                name: confirmingMember?.displayName ?? "",
              })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("chat.group.membersSection.confirmDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("chat.group.membersSection.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (confirmingMemberId) onRemoveMember?.(confirmingMemberId);
                setConfirmingMemberId(null);
              }}
            >
              {t("chat.group.membersSection.remove")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
