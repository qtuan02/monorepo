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
 * .agents/rules/architecture-shared-components.md).
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
    <li className="border-border flex items-center justify-between gap-3 rounded-xl border p-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <ConversationAvatar
          title={displayName}
          avatarUrl={user.avatarUrl ?? undefined}
          online={online}
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{displayName}</p>
          <p className="text-muted-foreground truncate text-xs">
            @{user.username}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {friendStatus === FriendStatus.NONE && onSendRequest && (
          <Button
            type="button"
            size="sm"
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
            size="sm"
            variant="ghost"
            disabled={isActionPending}
            onClick={() => onCancelRequest(requestId)}
          >
            {isActionPending && <Loader2 className="size-3.5 animate-spin" />}
            Cancel request
          </Button>
        )}

        {friendStatus === FriendStatus.RECEIVED && (
          <Button type="button" size="sm" variant="ghost" disabled>
            Request received
          </Button>
        )}

        {friendStatus === FriendStatus.SELF && (
          <span className="text-muted-foreground text-xs">You</span>
        )}

        {friendStatus === FriendStatus.FRIEND && (
          <>
            {onMessage && (
              <Button type="button" size="sm" onClick={() => onMessage(user)}>
                Message
              </Button>
            )}
            {onUnfriend && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={isActionPending}
                onClick={() => setIsConfirmOpen(true)}
              >
                Unfriend
              </Button>
            )}
          </>
        )}
      </div>

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
    </li>
  );
}
