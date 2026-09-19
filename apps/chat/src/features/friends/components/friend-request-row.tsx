import { Check, Loader2, X } from "lucide-react";

import type { ChatFriendRequestUser } from "@monorepo/types/chat-friend";
import { Button } from "@monorepo/ui/components/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@monorepo/ui/components/item";

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
 * Built on the same `Item` anatomy as `UserItem` (brief §10 row 21, story
 * 54) — deliberately lighter than it otherwise: a request row never opens a
 * detail dialog and its action is a single yes/no/cancel. Decline is an
 * `outline` button, never `destructive` — declining isn't the irreversible
 * action Unfriend/Leave keep their red confirm dialog for (story 52). Every
 * action is a 44px mobile touch target, back to the primitive default from
 * `md` (story 51).
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
    <Item variant="outline">
      <ItemMedia>
        <ConversationAvatar
          title={displayName}
          avatarUrl={requestUser.avatarUrl ?? undefined}
        />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{displayName}</ItemTitle>
        <ItemDescription>@{requestUser.username}</ItemDescription>
      </ItemContent>

      {variant === "sent" ? (
        <ItemActions className="gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-11 md:size-8"
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
        </ItemActions>
      ) : (
        <ItemActions className="gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-11 md:size-8"
            disabled={isProcessing}
            aria-label="Decline friend request"
            onClick={() => onDecline?.(requestId)}
          >
            <X className="size-3.5" />
          </Button>
          <Button
            type="button"
            size="icon"
            className="size-11 md:size-8"
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
        </ItemActions>
      )}
    </Item>
  );
}
