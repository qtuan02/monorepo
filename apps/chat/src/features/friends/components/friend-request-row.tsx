import { Check, Loader2, X } from "lucide-react";

import type { ChatFriendRequestUser } from "@monorepo/types/chat-friend";
import { Button } from "@monorepo/ui/components/button";

import { ConversationAvatar } from "~/components/avatar/conversation-avatar";
import { getDisplayName } from "~/utils/display";

interface FriendRequestRowProps {
  requestId: string;
  requestUser: ChatFriendRequestUser;
  variant: "received" | "sent";
  isProcessing: boolean;
  onAccept?: (requestId: string) => void;
  onDecline?: (requestId: string) => void;
  onCancel?: (requestId: string) => void;
}

/**
 * Deliberately lighter than `UserItem` — a request row never opens a detail
 * dialog and its action is a single yes/no/cancel, not the four-status
 * branch `UserItem` handles for the friend list and the find-people search.
 */
export function FriendRequestRow({
  requestId,
  requestUser,
  variant,
  isProcessing,
  onAccept,
  onDecline,
  onCancel,
}: FriendRequestRowProps) {
  const displayName = getDisplayName(requestUser);

  return (
    <li className="border-border flex items-center justify-between gap-3 rounded-xl border p-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <ConversationAvatar
          title={displayName}
          avatarUrl={requestUser.avatarUrl ?? undefined}
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{displayName}</p>
          <p className="text-muted-foreground truncate text-xs">
            @{requestUser.username}
          </p>
        </div>
      </div>

      {variant === "sent" ? (
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          disabled={isProcessing}
          aria-label="Cancel friend request"
          onClick={() => onCancel?.(requestId)}
        >
          {isProcessing ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <X className="size-3.5" />
          )}
        </Button>
      ) : (
        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            type="button"
            size="icon-sm"
            variant="destructive"
            disabled={isProcessing}
            aria-label="Decline friend request"
            onClick={() => onDecline?.(requestId)}
          >
            <X className="size-3.5" />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            disabled={isProcessing}
            aria-label="Accept friend request"
            onClick={() => onAccept?.(requestId)}
          >
            {isProcessing ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Check className="size-3.5" />
            )}
          </Button>
        </div>
      )}
    </li>
  );
}
