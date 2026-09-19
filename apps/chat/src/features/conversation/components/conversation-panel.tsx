import { ArrowLeft, Info, MessageCircle } from "lucide-react";
import { Link, useNavigate } from "react-router";

import {
  ChatConversationType,
  ChatParticipantRole,
} from "@monorepo/types/chat-conversation";
import { Button, buttonVariants } from "@monorepo/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@monorepo/ui/components/empty";
import { cn } from "@monorepo/ui/utils/cn";

import type { Conversation } from "~/features/conversation/types/conversation";
import type { DirectMessageUser } from "~/types/direct-message-user";
import { ConversationAvatar } from "~/components/avatar/conversation-avatar";
import { ROUTES } from "~/constants/routes";
import { ConversationDetailsPanel } from "~/features/conversation/components/conversation-details-panel";
import MessageComposer from "~/features/conversation/components/message-composer";
import MessageList from "~/features/conversation/components/message-list";
import { useConversationList } from "~/features/conversation/hooks/use-conversation-list";
import { createDraftConversationId } from "~/features/conversation/utils/direct-message-draft";
import { useCurrentUserQuery } from "~/hooks/api/user";
import { useSocketStore } from "~/stores/use-socket-store";
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
): Conversation {
  return {
    id: createDraftConversationId(draftUser.id),
    type: ChatConversationType.DIRECT,
    title: getDisplayName(draftUser),
    lastMessage: "No messages yet.",
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
  const navigate = useNavigate();
  const { conversations } = useConversationList();
  const currentUserQuery = useCurrentUserQuery();
  const conversation = conversationId
    ? conversations.find((item) => item.id === conversationId)
    : undefined;
  const currentUserId = currentUserQuery.data?.id;
  const draftConversation =
    draftUser && currentUserId
      ? buildDraftConversation(draftUser, currentUserId)
      : undefined;
  const activeConversation = conversation ?? draftConversation;

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

  if (!conversationId && !draftUser) {
    return (
      <Empty className="h-full flex-1">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MessageCircle />
          </EmptyMedia>
          <EmptyTitle>Pick a conversation</EmptyTitle>
        </EmptyHeader>
        <EmptyContent>
          <Link
            to={ROUTES.FRIENDS}
            className={cn(buttonVariants({ variant: "default" }))}
          >
            New message
          </Link>
        </EmptyContent>
      </Empty>
    );
  }

  const title = activeConversation?.title ?? "Conversation";
  const isGroup = activeConversation?.type === ChatConversationType.GROUP;
  const memberCount = activeConversation?.members.length ?? 0;
  const subtitle = isGroup
    ? `${memberCount} members · ${onlineMemberCount} online`
    : isOtherMemberOnline
      ? "Active now"
      : undefined;

  return (
    <div className="flex h-full min-h-0 flex-1">
      <div className="flex h-full min-h-0 flex-1 flex-col">
        <header className="border-border flex h-[68px] shrink-0 items-center gap-2 border-b px-3">
          {showBackButton && (
            // A control that navigates is a styled Link, never a Button
            // rendering one — see .agents/rules/architecture-ui-primitives.md.
            <Link
              to={ROUTES.HOME}
              aria-label="Back to conversations"
              className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
            >
              <ArrowLeft className="size-4" />
            </Link>
          )}
          <ConversationAvatar
            title={title}
            avatarUrl={activeConversation?.avatarUrl}
            online={!isGroup && isOtherMemberOnline}
          />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[15px] font-semibold">{title}</h1>
            {subtitle && (
              <p className="text-muted-foreground flex items-center gap-1.5 truncate text-xs">
                {!isGroup && (
                  <span className="bg-online inline-block size-1.5 shrink-0 rounded-full" />
                )}
                {subtitle}
              </p>
            )}
          </div>
          {activeConversation && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="size-11 md:size-9"
              onClick={() => onDetailsOpenChange(true)}
              aria-label="Conversation details"
            >
              <Info className="size-4" />
            </Button>
          )}
        </header>
        <div className="min-h-0 flex-1">
          {draftUser ? (
            <Empty className="h-full">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <MessageCircle />
                </EmptyMedia>
                <EmptyTitle>No messages yet</EmptyTitle>
                <EmptyDescription>Say hi to {title}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            conversationId && <MessageList conversationId={conversationId} />
          )}
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
      </div>

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
    </div>
  );
}
