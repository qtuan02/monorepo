import * as React from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useIsMobile } from "@monorepo/hook/use-is-mobile";
import { ChatConversationType } from "@monorepo/types/chat-conversation";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@monorepo/ui/components/sheet";

import type { Conversation } from "~/features/conversation/types/conversation";
import { ConversationAvatar } from "~/components/avatar/conversation-avatar";
import { Island } from "~/components/island/island";
import { UserDetailDialog } from "~/components/user-detail-dialog";
import GroupPanelTemplate from "~/features/group/templates/group-panel.template";
import { useRemoveFriendMutation } from "~/hooks/api/friend";
import { useUserInfoQuery } from "~/hooks/api/user";
import { useSocketStore } from "~/stores/use-socket-store";

interface ConversationDetailsPanelProps {
  conversation: Conversation;
  open: boolean;
  onClose: () => void;
  /** Group conversations navigate Home once the visitor leaves. */
  onLeftGroup: () => void;
}

/** Direct half of the details panel — avatar 88 with a ring, name,
 * `@username`, text+dot presence, bio, and the two actions story 45 asks
 * for. No invented numbers (no stat boxes — brief §10 row 12). */
function DirectProfileSection({
  conversation,
  onClose,
}: {
  conversation: Conversation;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const otherMember = conversation.members.find(
    (member) => member.userId !== conversation.currentUserId,
  );
  const userInfoQuery = useUserInfoQuery(otherMember?.userId);
  const isOnline = useSocketStore((state) =>
    otherMember ? state.onlineUsers.includes(otherMember.userId) : false,
  );
  const removeFriendMutation = useRemoveFriendMutation();

  if (!otherMember) return null;

  return (
    <section className="grid gap-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <ConversationAvatar
          title={otherMember.displayName}
          avatarUrl={otherMember.avatarUrl}
          className="ring-primary/20 ring-offset-background size-22 ring-4 ring-offset-2"
        />
        <div>
          <p className="text-base font-semibold">{otherMember.displayName}</p>
          {otherMember.username && (
            <p className="text-muted-foreground text-xs">
              @{otherMember.username}
            </p>
          )}
          {isOnline && (
            <p className="text-muted-foreground mt-0.5 flex items-center justify-center gap-1.5 text-xs">
              <span className="bg-online inline-block size-1.5 rounded-full" />
              {t("chat.convList.activeNow")}
            </p>
          )}
        </div>
      </div>

      {userInfoQuery.data?.bio && (
        <p className="bg-muted/40 rounded-xl px-3 py-2.5 text-sm">
          {userInfoQuery.data.bio}
        </p>
      )}

      <div className="flex items-center justify-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsDetailOpen(true)}
        >
          {t("chat.convList.viewProfile")}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsConfirmOpen(true)}
        >
          {t("chat.convList.unfriend")}
        </Button>
      </div>

      <UserDetailDialog
        userId={otherMember.userId}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("chat.convList.removeFriendTitle", {
                name: otherMember.displayName,
              })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("chat.convList.removeFriendDescription", {
                name: otherMember.displayName,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("chat.convList.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={removeFriendMutation.isPending}
              onClick={() => {
                setIsConfirmOpen(false);
                removeFriendMutation.mutate(otherMember.userId, {
                  onSuccess: onClose,
                });
              }}
            >
              {removeFriendMutation.isPending
                ? t("chat.convList.removing")
                : t("chat.convList.remove")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

function ConversationDetailsContent({
  conversation,
  onClose,
  onLeftGroup,
}: {
  conversation: Conversation;
  onClose: () => void;
  onLeftGroup: () => void;
}) {
  return conversation.type === ChatConversationType.GROUP ? (
    <GroupPanelTemplate conversation={conversation} onLeft={onLeftGroup} />
  ) : (
    <DirectProfileSection conversation={conversation} onClose={onClose} />
  );
}

/**
 * Desktop renders a third Island beside the pane's (brief §10 row 19);
 * mobile renders the same content in a Sheet, so neither surface duplicates
 * the group/direct branching in `ConversationDetailsContent`. Open/close
 * state is the caller's — `ConversationShellTemplate` owns it so it survives
 * switching from one conversation to another in the same session (brief
 * §10 row 12, story 44).
 */
export function ConversationDetailsPanel({
  conversation,
  open,
  onClose,
  onLeftGroup,
}: ConversationDetailsPanelProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const title =
    conversation.type === ChatConversationType.GROUP
      ? t("chat.convList.groupInfo")
      : t("chat.convList.profile");

  if (isMobile) {
    return (
      <Sheet
        open={open}
        onOpenChange={(next) => {
          if (!next) onClose();
        }}
      >
        <SheetContent side="right" className="overflow-y-auto p-4">
          <SheetHeader className="p-0">
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
          <ConversationDetailsContent
            conversation={conversation}
            onClose={onClose}
            onLeftGroup={onLeftGroup}
          />
        </SheetContent>
      </Sheet>
    );
  }

  if (!open) return null;

  return (
    <Island className="flex h-full w-80 shrink-0 flex-col gap-4 overflow-y-auto p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        <Button
          type="button"
          size="icon-sm"
          variant="outline"
          onClick={onClose}
          aria-label={t("chat.convList.closeDetails")}
        >
          <X className="size-4" />
        </Button>
      </div>
      <ConversationDetailsContent
        conversation={conversation}
        onClose={onClose}
        onLeftGroup={onLeftGroup}
      />
    </Island>
  );
}
