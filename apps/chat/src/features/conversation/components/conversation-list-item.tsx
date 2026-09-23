import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { defaultLanguage } from "@monorepo/i18n/languages";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@monorepo/ui/components/item";
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

/**
 * A row `Item`, rendered as the router `Link` itself via `render` rather
 * than wrapped in one — see .agents/rules/architecture-ui-primitives.md. An
 * open conversation floats as a card instead of sharing the hover tint, so
 * the two states never read as the same colour (brief §10 row 21).
 */
export default function ConversationListItem({
  conversation,
  active,
}: ConversationListItemProps) {
  const { i18n } = useTranslation();
  const hasUnread = conversation.unreadCount > 0;
  const isOtherMemberOnline = useSocketStore((state) =>
    conversation.otherMemberId
      ? state.onlineUsers.includes(conversation.otherMemberId)
      : false,
  );

  return (
    <Item
      size="sm"
      render={<Link to={ROUTES.conversationByIdPath(conversation.id)} />}
      className={cn(
        // `w-auto`: Item is `w-full`, and 100% + the side margins is exactly
        // the 16px that used to make the Virtuoso scroller scroll sideways.
        "mx-2 my-1 w-auto rounded-xl transition-colors",
        active
          ? "bg-background ring-border/60 shadow-sm ring-1"
          : "hover:bg-accent",
      )}
    >
      <ItemMedia>
        <ConversationAvatar
          title={conversation.title}
          avatarUrl={conversation.avatarUrl}
          online={isOtherMemberOnline}
          className="size-10"
        />
      </ItemMedia>
      {/* `min-w-0`: ItemContent is `flex-1` with the default min-width:auto,
          so one long unbroken preview token would widen the row past the
          list and put a horizontal scrollbar on it. */}
      <ItemContent className="min-w-0">
        <ItemTitle className="w-full min-w-0 justify-between">
          <span
            className={cn(
              "truncate",
              hasUnread ? "font-semibold" : "font-medium",
            )}
          >
            {conversation.title}
          </span>
          {conversation.lastMessageAt && (
            <span className="text-muted-foreground shrink-0 text-xs font-normal tabular-nums">
              {formatConversationTimestamp(
                conversation.lastMessageAt,
                i18n.resolvedLanguage ?? defaultLanguage,
              )}
            </span>
          )}
        </ItemTitle>
        <ItemDescription
          className={cn(
            "line-clamp-1 wrap-anywhere",
            hasUnread && "text-foreground font-medium",
          )}
        >
          {conversation.lastMessage}
        </ItemDescription>
      </ItemContent>
      {hasUnread && (
        <ItemActions>
          <span className="bg-primary text-primary-foreground flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums">
            {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
          </span>
        </ItemActions>
      )}
    </Item>
  );
}
