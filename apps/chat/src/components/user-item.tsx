import * as React from "react";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

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
import { Badge } from "@monorepo/ui/components/badge";
import { Button } from "@monorepo/ui/components/button";
import { Item, ItemActions } from "@monorepo/ui/components/item";
import { cn } from "@monorepo/ui/utils/cn";

import type { DirectMessageUser } from "~/types/direct-message-user";
import { ConversationAvatar } from "~/components/avatar/conversation-avatar";
import { UserDetailDialog } from "~/components/user-detail-dialog";
import { getDisplayName } from "~/utils/display";

interface UserItemProps {
  user: DirectMessageUser;
  friendStatus: FriendStatus;
  /** Required to act on a SENT (cancel) or RECEIVED (accept/decline) request. */
  requestId?: string;
  online?: boolean;
  isActionPending?: boolean;
  onMessage?: (user: DirectMessageUser) => void;
  onSendRequest?: (userId: string) => void;
  onCancelRequest?: (requestId: string) => void;
  onAccept?: (requestId: string) => void;
  onDecline?: (requestId: string) => void;
  onUnfriend?: (userId: string) => void;
}

/** 36px on a phone, 32px from `md` — the compact target design brief §1.7
 * settled on for these row actions (ux#22/23: ≥24px on web, ≥8px apart). */
const ACTION_CLASS_NAME = "h-9 md:h-8";

/**
 * The one row for "someone who isn't me" — the friend list, both request
 * queues and the find-people search all render it, so the whole Friends
 * screen reads as one shape (see .agents/rules/architecture-shared-
 * components.md). Avatar + name are the button that opens the person's
 * read-only detail; the actions sit on the right, at most one primary
 * (Message / Add friend / Accept) beside one `outline` — never ghost, never
 * destructive: Unfriend is the one irreversible action and keeps its confirm
 * dialog (story 52), Decline does not.
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
  onAccept,
  onDecline,
  onUnfriend,
}: UserItemProps) {
  const { t } = useTranslation();
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const displayName = getDisplayName(user);
  const spinner = isActionPending && (
    <Loader2 className="size-3.5 animate-spin" />
  );

  return (
    <Item
      variant="outline"
      size="sm"
      className="hover:bg-muted/40 bg-card/60 transition-colors"
    >
      <button
        type="button"
        className="focus-visible:ring-ring/50 -m-1 flex min-w-0 flex-1 items-center gap-2.5 rounded-md p-1 text-left outline-none focus-visible:ring-[3px]"
        onClick={() => setIsDetailOpen(true)}
      >
        <ConversationAvatar
          title={displayName}
          avatarUrl={user.avatarUrl ?? undefined}
          online={online}
          className="size-10"
        />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium">{displayName}</span>
          <span className="text-muted-foreground truncate text-xs">
            @{user.username}
          </span>
        </span>
      </button>

      <ItemActions className="ml-auto gap-2">
        {friendStatus === FriendStatus.SELF && (
          <Badge variant="secondary">{t("chat.common.you")}</Badge>
        )}

        {friendStatus === FriendStatus.NONE && onSendRequest && (
          <Button
            type="button"
            size="sm"
            className={ACTION_CLASS_NAME}
            disabled={isActionPending}
            onClick={() => onSendRequest(user.id)}
          >
            {spinner}
            {t("chat.common.addFriend")}
          </Button>
        )}

        {friendStatus === FriendStatus.SENT && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className={ACTION_CLASS_NAME}
            disabled={isActionPending || !onCancelRequest || !requestId}
            onClick={() => requestId && onCancelRequest?.(requestId)}
          >
            {spinner}
            {t("chat.common.cancelRequest")}
          </Button>
        )}

        {friendStatus === FriendStatus.RECEIVED &&
          (onAccept && onDecline && requestId ? (
            <>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className={ACTION_CLASS_NAME}
                disabled={isActionPending}
                onClick={() => onDecline(requestId)}
              >
                {t("chat.common.decline")}
              </Button>
              <Button
                type="button"
                size="sm"
                className={ACTION_CLASS_NAME}
                disabled={isActionPending}
                onClick={() => onAccept(requestId)}
              >
                {spinner}
                {t("chat.common.accept")}
              </Button>
            </>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className={ACTION_CLASS_NAME}
              disabled
            >
              {t("chat.common.statusReceived")}
            </Button>
          ))}

        {friendStatus === FriendStatus.FRIEND && (
          <>
            {onUnfriend && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className={ACTION_CLASS_NAME}
                disabled={isActionPending}
                onClick={() => setIsConfirmOpen(true)}
              >
                {spinner}
                {t("chat.common.unfriend")}
              </Button>
            )}
            {onMessage && (
              <Button
                type="button"
                size="sm"
                className={cn(ACTION_CLASS_NAME, "px-4")}
                onClick={() => onMessage(user)}
              >
                {t("chat.common.message")}
              </Button>
            )}
          </>
        )}
      </ItemActions>

      <UserDetailDialog
        userId={user.id}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />

      {onUnfriend && (
        <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t("chat.common.removeConfirmTitle", { name: displayName })}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t("chat.common.removeConfirmDescription", {
                  name: displayName,
                })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("chat.common.cancel")}</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={isActionPending}
                onClick={() => {
                  setIsConfirmOpen(false);
                  onUnfriend(user.id);
                }}
              >
                {isActionPending
                  ? t("chat.common.removing")
                  : t("chat.common.remove")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </Item>
  );
}
