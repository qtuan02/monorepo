import { ArrowLeft, Info } from "lucide-react";
import { Link, useNavigate } from "react-router";

import {
  ChatConversationType,
  ChatParticipantRole,
} from "@monorepo/types/chat-conversation";
import { Button, buttonVariants } from "@monorepo/ui/components/button";
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

  const isOtherMemberOnline = useSocketStore((state) => {
    const otherMemberId = conversation?.otherMemberId ?? draftUser?.id;
    return otherMemberId ? state.onlineUsers.includes(otherMemberId) : false;
  });

  if (!conversationId && !draftUser) {
    return (
      <div className="flex h-full flex-1 items-center justify-center p-6">
        <p className="text-muted-foreground text-sm">
          Pick a conversation to begin.
        </p>
      </div>
    );
  }

  const currentUserId = currentUserQuery.data?.id;
  const draftConversation =
    draftUser && currentUserId
      ? buildDraftConversation(draftUser, currentUserId)
      : undefined;
  const activeConversation = conversation ?? draftConversation;
  const title = activeConversation?.title ?? "Conversation";

  return (
    <div className="flex h-full min-h-0 flex-1">
      <div className="flex h-full min-h-0 flex-1 flex-col">
        <header className="border-border flex items-center gap-2 border-b px-3 py-2">
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
            online={isOtherMemberOnline}
          />
          <h1 className="min-w-0 flex-1 truncate text-sm font-semibold">
            {title}
          </h1>
          {activeConversation && (
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              onClick={() => onDetailsOpenChange(true)}
              aria-label="Conversation details"
            >
              <Info className="size-4" />
            </Button>
          )}
        </header>
        <div className="min-h-0 flex-1">
          {draftUser ? (
            <div className="flex h-full items-center justify-center p-6">
              <p className="text-muted-foreground text-sm">No messages yet.</p>
            </div>
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
