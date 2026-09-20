import { ArrowLeft, Info, MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";

import {
  ChatConversationType,
  ChatParticipantRole,
} from "@monorepo/types/chat-conversation";
import { Button, buttonVariants } from "@monorepo/ui/components/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@monorepo/ui/components/empty";
import { cn } from "@monorepo/ui/utils/cn";

import type { Conversation } from "~/features/conversation/types/conversation";
import type { DirectMessageUser } from "~/types/direct-message-user";
import { ConversationAvatar } from "~/components/avatar/conversation-avatar";
import IslandBoundary from "~/components/exception/island-boundary";
import { Island } from "~/components/island/island";
import { ROUTES } from "~/constants/routes";
import { ConversationDetailsPanel } from "~/features/conversation/components/conversation-details-panel";
import MessageComposer from "~/features/conversation/components/message-composer";
import MessageList from "~/features/conversation/components/message-list";
import { useConversationList } from "~/features/conversation/hooks/use-conversation-list";
import { conversationQueryKeys } from "~/hooks/api/conversation";
import { messageQueryKeys } from "~/hooks/api/message";
import { useCurrentUserQuery } from "~/hooks/api/user";
import { useSocketStore } from "~/stores/use-socket-store";
import { createDraftConversationId } from "~/utils/direct-message-draft";
import { getDisplayName } from "~/utils/display";

interface ConversationPanelProps {
  conversationId?: string;
  /** A Draft conversation (CONTEXT.md) — mutually exclusive with `conversationId`. */
  draftUser?: DirectMessageUser;
  showBackButton?: boolean;
  /** Owned by `ConversationShellTemplate` so it survives a conversationId switch. */
  detailsOpen: boolean;
  onDetailsOpenChange: (open: boolean) => void;
}

function buildDraftConversation(
  draftUser: DirectMessageUser,
  currentUserId: string,
  noMessagesYet: string,
): Conversation {
  return {
    id: createDraftConversationId(draftUser.id),
    type: ChatConversationType.DIRECT,
    title: getDisplayName(draftUser),
    lastMessage: noMessagesYet,
    lastMessageAt: null,
    unreadCount: 0,
    avatarUrl: draftUser.avatarUrl ?? undefined,
    members: [
      {
        userId: currentUserId,
        displayName: "",
        role: ChatParticipantRole.MEMBER,
      },
      {
        userId: draftUser.id,
        displayName: getDisplayName(draftUser),
        avatarUrl: draftUser.avatarUrl ?? undefined,
        role: ChatParticipantRole.MEMBER,
      },
    ],
    otherMemberId: draftUser.id,
    currentUserId,
  };
}

export default function ConversationPanel({
  conversationId,
  draftUser,
  showBackButton,
  detailsOpen,
  onDetailsOpenChange,
}: ConversationPanelProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { conversations } = useConversationList();
  const currentUserQuery = useCurrentUserQuery();
  const conversation = conversationId
    ? conversations.find((item) => item.id === conversationId)
    : undefined;
  const currentUserId = currentUserQuery.data?.id;
  const draftConversation =
    draftUser && currentUserId
      ? buildDraftConversation(
          draftUser,
          currentUserId,
          t("chat.convPane.empty.noMessagesYet"),
        )
      : undefined;
  const activeConversation = conversation ?? draftConversation;

  const isConnected = useSocketStore((state) => state.isConnected);
  const isOtherMemberOnline = useSocketStore((state) => {
    const otherMemberId = conversation?.otherMemberId ?? draftUser?.id;
    return otherMemberId ? state.onlineUsers.includes(otherMemberId) : false;
  });
  const onlineMemberCount = useSocketStore((state) => {
    if (!activeConversation) return 0;
    return activeConversation.members.filter(
      (member) =>
        member.userId !== currentUserId &&
        state.onlineUsers.includes(member.userId),
    ).length;
  });

  if (!conversationId && !draftUser) return <NoConversationSelected />;

  const title =
    activeConversation?.title ?? t("chat.convPane.header.fallbackTitle");
  const isGroup = activeConversation?.type === ChatConversationType.GROUP;
  const memberCount = activeConversation?.members.length ?? 0;
  // Presence is only meaningful while the socket is actually connected — a
  // stale `onlineUsers` snapshot from before a drop would otherwise read as
  // "everyone's offline" instead of "we don't know right now" (T4, brief §10 row 13).
  const subtitle = !isConnected
    ? undefined
    : isGroup
      ? t("chat.convPane.header.groupSubtitle", {
          memberCount,
          onlineMemberCount,
        })
      : isOtherMemberOnline
        ? t("chat.convPane.header.activeNow")
        : undefined;

  return (
    <>
      <Island className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        <header className="border-border/60 flex h-16 shrink-0 items-center gap-3 border-b px-3 md:px-4">
          {showBackButton && (
            // A control that navigates is a styled Link, never a Button
            // rendering one — see .agents/rules/architecture-ui-primitives.md.
            <Link
              to={ROUTES.HOME}
              aria-label={t("chat.convPane.header.backToConversations")}
              className={cn(
                buttonVariants({ variant: "outline", size: "icon" }),
                "-ml-1 rounded-full",
              )}
            >
              <ArrowLeft className="size-5" />
            </Link>
          )}
          <ConversationAvatar
            title={title}
            avatarUrl={activeConversation?.avatarUrl}
            online={isConnected && !isGroup && isOtherMemberOnline}
            className="size-10"
          />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[15px] leading-tight font-semibold">
              {title}
            </h1>
            {!isConnected ? (
              <span className="bg-muted text-muted-foreground mt-0.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium">
                {t("chat.convPane.header.reconnecting")}
              </span>
            ) : (
              subtitle && (
                <p className="text-muted-foreground flex items-center gap-1.5 truncate text-xs">
                  {!isGroup && (
                    <span className="bg-online inline-block size-1.5 shrink-0 rounded-full" />
                  )}
                  {subtitle}
                </p>
              )
            )}
          </div>
          {activeConversation && (
            // Ink, not teal, once open — it says where you are (brief §10
            // row 2), and pressing it again closes what it opened.
            <Button
              type="button"
              size="icon"
              variant="outline"
              aria-pressed={detailsOpen}
              className={cn(
                "size-11 rounded-full md:size-9",
                detailsOpen &&
                  "border-foreground bg-foreground text-background hover:bg-foreground/90 hover:text-background",
              )}
              onClick={() => onDetailsOpenChange(!detailsOpen)}
              aria-label={t("chat.convPane.header.detailsButton")}
            >
              <Info className="size-4" />
            </Button>
          )}
        </header>
        <div className="min-h-0 flex-1">
          <IslandBoundary
            queryKey={
              conversationId
                ? [
                    messageQueryKeys.byConversation(conversationId),
                    conversationQueryKeys.all,
                  ]
                : conversationQueryKeys.all
            }
            resetKeys={[conversationId]}
          >
            {draftUser ? (
              <Empty className="h-full">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <MessageCircle />
                  </EmptyMedia>
                  <EmptyTitle>{t("chat.convPane.draft.emptyTitle")}</EmptyTitle>
                  <EmptyDescription className="max-md:hidden">
                    {t("chat.convPane.draft.sayHiTo", { title })}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              conversationId && (
                <MessageList
                  key={conversationId}
                  conversationId={conversationId}
                />
              )
            )}
          </IslandBoundary>
        </div>
        {activeConversation && (
          <MessageComposer
            key={activeConversation.id}
            conversation={activeConversation}
            onSent={
              draftUser
                ? (message) =>
                    navigate(
                      ROUTES.conversationByIdPath(message.conversationId),
                      { replace: true },
                    )
                : undefined
            }
          />
        )}
      </Island>

      {activeConversation && (
        <ConversationDetailsPanel
          conversation={activeConversation}
          open={detailsOpen}
          onClose={() => onDetailsOpenChange(false)}
          onLeftGroup={() => {
            onDetailsOpenChange(false);
            navigate(ROUTES.HOME);
          }}
        />
      )}
    </>
  );
}

/** The pane's empty state. Starting a chat is the list's search box — it
 * finds people too — so this points there instead of opening a second flow. */
function NoConversationSelected() {
  const { t } = useTranslation();
  return (
    <Island className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <Empty className="h-full flex-1">
        <EmptyHeader>
          <EmptyMedia
            variant="icon"
            className="from-primary/15 to-primary/5 text-primary size-14 rounded-2xl bg-gradient-to-br"
          >
            <MessageCircle className="size-7" />
          </EmptyMedia>
          <EmptyTitle>{t("chat.convPane.empty.pickTitle")}</EmptyTitle>
          <EmptyDescription className="max-md:hidden">
            {t("chat.convPane.empty.pickDescription")}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </Island>
  );
}
