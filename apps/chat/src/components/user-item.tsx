import * as React from "react";
import { Loader2 } from "lucide-react";

import { FriendStatus } from "@monorepo/types/chat-friend";
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
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@monorepo/ui/components/item";

import type { DirectMessageUser } from "~/types/direct-message-user";
import { ConversationAvatar } from "~/components/avatar/conversation-avatar";
import { getDisplayName } from "~/utils/display";

interface UserItemProps {
  user: DirectMessageUser;
  friendStatus: FriendStatus;
  /** Only meaningful (and required to act) when `friendStatus` is SENT. */
  requestId?: string;
  online?: boolean;
  isActionPending?: boolean;
  onMessage?: (user: DirectMessageUser) => void;
  onSendRequest?: (userId: string) => void;
  onCancelRequest?: (requestId: string) => void;
  onUnfriend?: (userId: string) => void;
}

/**
 * The shared row for "someone who isn't me" — the friend list and the find-
 * people search both render it, self-fetching nothing (their query already
 * carries `friendStatus`) but owning its own confirm step for Unfriend (see
 * .agents/rules/architecture-shared-components.md). Built on `Item` so this
 * row, `FriendRequestRow` and a group's member row share one anatomy (brief
 * §10 row 12/21, story 54); the action row keeps every button at a 44px
 * mobile touch target, back to the primitive default from `md` (story 51).
 */
export function UserItem({
  user,
  friendStatus,
  requestId,
  online,
  isActionPending = false,
  onMessage,
  onSendRequest,
  onCancelRequest,
  onUnfriend,
}: UserItemProps) {
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const displayName = getDisplayName(user);

  return (
    <Item variant="outline">
      <ItemMedia>
        <ConversationAvatar
          title={displayName}
          avatarUrl={user.avatarUrl ?? undefined}
          online={online}
        />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{displayName}</ItemTitle>
        <ItemDescription>@{user.username}</ItemDescription>
      </ItemContent>

      <ItemActions className="gap-2">
        {friendStatus === FriendStatus.NONE && onSendRequest && (
          <Button
            type="button"
            className="h-11 md:h-9"
            disabled={isActionPending}
            onClick={() => onSendRequest(user.id)}
          >
            {isActionPending && <Loader2 className="size-3.5 animate-spin" />}
            Add friend
          </Button>
        )}

        {friendStatus === FriendStatus.SENT && onCancelRequest && requestId && (
          <Button
            type="button"
            variant="ghost"
            className="h-11 md:h-9"
            disabled={isActionPending}
            onClick={() => onCancelRequest(requestId)}
          >
            {isActionPending && <Loader2 className="size-3.5 animate-spin" />}
            Cancel request
          </Button>
        )}

        {friendStatus === FriendStatus.RECEIVED && (
          <Button
            type="button"
            variant="ghost"
            className="h-11 md:h-9"
            disabled
          >
            Request received
          </Button>
        )}

        {friendStatus === FriendStatus.SELF && (
          <span className="text-muted-foreground text-xs">You</span>
        )}

        {friendStatus === FriendStatus.FRIEND && (
          <>
            {onMessage && (
              <Button
                type="button"
                className="h-11 md:h-9"
                onClick={() => onMessage(user)}
              >
                Message
              </Button>
            )}
            {onUnfriend && (
              <Button
                type="button"
                variant="ghost"
                className="h-11 md:h-9"
                disabled={isActionPending}
                onClick={() => setIsConfirmOpen(true)}
              >
                Unfriend
              </Button>
            )}
          </>
        )}
      </ItemActions>

      {onUnfriend && (
        <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove {displayName}?</AlertDialogTitle>
              <AlertDialogDescription>
                {displayName} will be removed from your friends list. You can
                send a new friend request later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={isActionPending}
                onClick={() => {
                  setIsConfirmOpen(false);
                  onUnfriend(user.id);
                }}
              >
                {isActionPending ? "Removing..." : "Remove"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </Item>
  );
}
