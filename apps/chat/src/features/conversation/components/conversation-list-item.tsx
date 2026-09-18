import { Link } from "react-router";

import { cn } from "@monorepo/ui/utils/cn";

import type { Conversation } from "~/features/conversation/types/conversation";
import { ConversationAvatar } from "~/components/avatar/conversation-avatar";
import { ROUTES } from "~/constants/routes";
import { useSocketStore } from "~/stores/use-socket-store";
import { formatConversationTimestamp } from "~/utils/date";

interface ConversationListItemProps {
  conversation: Conversation;
  active: boolean;
}

export default function ConversationListItem({
  conversation,
  active,
}: ConversationListItemProps) {
  const hasUnread = conversation.unreadCount > 0;
  const isOtherMemberOnline = useSocketStore((state) =>
    conversation.otherMemberId
      ? state.onlineUsers.includes(conversation.otherMemberId)
      : false,
  );

  return (
    <Link
      to={ROUTES.conversationByIdPath(conversation.id)}
      className={cn(
        "border-border hover:bg-accent flex items-center gap-3 border-b px-3 py-3",
        active && "bg-accent",
      )}
    >
      <ConversationAvatar
        title={conversation.title}
        avatarUrl={conversation.avatarUrl}
        online={isOtherMemberOnline}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "truncate text-sm",
              hasUnread ? "font-semibold" : "font-medium",
            )}
          >
            {conversation.title}
          </span>
          {conversation.lastMessageAt && (
            <span className="text-muted-foreground shrink-0 text-xs">
              {formatConversationTimestamp(conversation.lastMessageAt)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "truncate text-sm",
              hasUnread ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {conversation.lastMessage}
          </span>
          {hasUnread && (
            <span className="bg-primary text-primary-foreground flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-xs font-medium">
              {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
