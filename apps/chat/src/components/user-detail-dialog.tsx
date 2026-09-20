import { useTranslation } from "react-i18next";

import { FriendStatus } from "@monorepo/types/chat-friend";
import { Button } from "@monorepo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@monorepo/ui/components/dialog";
import { Skeleton } from "@monorepo/ui/components/skeleton";

import { UserInfo } from "~/components/user-info";
import {
  useAcceptFriendRequestMutation,
  useCancelFriendRequestMutation,
} from "~/hooks/api/friend";
import { useUserInfoQuery } from "~/hooks/api/user";
import { useOpenDirectConversation } from "~/hooks/use-open-direct-conversation";
import { useSocketStore } from "~/stores/use-socket-store";

interface UserDetailDialogProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Named rows rather than an index key — see conversation-list.skeleton.tsx.
const SKELETON_ROWS = ["username", "email", "phone", "bio", "joined"];

/** Same footprint as `UserInfo`: header block, then the five rows. */
function UserDetailSkeleton() {
  return (
    <div className="grid gap-5">
      <div className="flex items-center gap-4">
        <Skeleton className="size-16 shrink-0 rounded-full" />
        <div className="grid gap-1.5">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3.5 w-20" />
        </div>
      </div>
      <div className="grid gap-3 rounded-xl p-3">
        {SKELETON_ROWS.map((row) => (
          <div key={`user-detail-${row}`} className="grid gap-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-3/5" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Mounted only while the dialog is open, so the read fires on open (see
 * .agents/rules/patterns-fetch-on-mount.md). */
function UserDetailBody({
  userId,
  onClose,
}: {
  userId: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const userQuery = useUserInfoQuery(userId);
  const isOnline = useSocketStore((state) =>
    state.onlineUsers.includes(userId),
  );
  const openDirectConversation = useOpenDirectConversation();
  const acceptMutation = useAcceptFriendRequestMutation();
  const cancelMutation = useCancelFriendRequestMutation();

  if (userQuery.isLoading) {
    return (
      <>
        <DialogTitle className="sr-only">
          {t("chat.common.profileTitle")}
        </DialogTitle>
        <UserDetailSkeleton />
      </>
    );
  }

  const user = userQuery.data;
  if (!user) {
    return (
      <div className="flex flex-col items-center gap-2">
        <DialogTitle className="sr-only">
          {t("chat.common.profileTitle")}
        </DialogTitle>
        <p className="text-destructive text-sm">
          {t("chat.common.profileLoadError")}
        </p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => userQuery.refetch()}
        >
          {t("chat.common.retry")}
        </Button>
      </div>
    );
  }

  return (
    <>
      <UserInfo
        user={user}
        online={isOnline}
        renderTitle={(name) => (
          <DialogTitle className="truncate text-lg">{name}</DialogTitle>
        )}
      />

      {user.statusFriend === FriendStatus.FRIEND && (
        <DialogFooter>
          <Button
            type="button"
            className="w-full"
            onClick={() => {
              onClose();
              openDirectConversation(user);
            }}
          >
            {t("chat.common.message")}
          </Button>
        </DialogFooter>
      )}

      {user.statusFriend === FriendStatus.SENT && user.requestId && (
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={cancelMutation.isPending}
            onClick={() => {
              if (user.requestId) cancelMutation.mutate(user.requestId);
            }}
          >
            {t("chat.common.cancelRequest")}
          </Button>
        </DialogFooter>
      )}

      {user.statusFriend === FriendStatus.RECEIVED && user.requestId && (
        <DialogFooter>
          <Button
            type="button"
            className="w-full"
            disabled={acceptMutation.isPending}
            onClick={() => {
              if (user.requestId) acceptMutation.mutate(user.requestId);
            }}
          >
            {t("chat.common.accept")}
          </Button>
        </DialogFooter>
      )}
    </>
  );
}

/**
 * Someone else's profile in a dialog — the friends screen's rows, a group's
 * member list and the Details panel's "View profile" all open it. The block
 * itself is `UserInfo`, so another frame (a sheet, a page) reuses it without
 * this dialog. `ChatUserInfo.requestId` carries the pending request behind a
 * SENT/RECEIVED status, so this is also where a visitor who opened the
 * dialog from a row with no request affordance (a group member, the details
 * panel's "View profile") can still revoke/accept.
 */
export function UserDetailDialog({
  userId,
  open,
  onOpenChange,
}: UserDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <UserDetailBody userId={userId} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
