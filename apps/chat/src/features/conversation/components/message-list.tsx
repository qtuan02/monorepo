import type { VirtuosoHandle } from "react-virtuoso";
import { useMemo, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Virtuoso } from "react-virtuoso";

import { defaultLanguage } from "@monorepo/i18n/languages";
import { ChatConversationType } from "@monorepo/types/chat-conversation";
import { Button } from "@monorepo/ui/components/button";
import { cn } from "@monorepo/ui/utils/cn";

import type { Message } from "~/features/conversation/types/message";
import { MessageListSkeleton } from "~/features/conversation/components/message-list.skeleton";
import MessageRow, {
  DateBadge,
} from "~/features/conversation/components/message-row";
import { useConversationMessages } from "~/features/conversation/hooks/use-conversation-messages";
import { useNewMessageIndicator } from "~/features/conversation/hooks/use-new-message-indicator";
import { groupMessages } from "~/features/conversation/utils/group-messages";
import {
  isSeenByOther,
  readersOf,
} from "~/features/conversation/utils/readers-of";
import { useCurrentUserQuery } from "~/hooks/api/user";
import { formatMessageDateLabel } from "~/utils/date";

interface MessageListProps {
  conversationId: string;
  /** T3 (spec #253) — opens the composer's edit mode on a visitor's own message. */
  onEditMessage?: (message: Message) => void;
}

export default function MessageList({
  conversationId,
  onEditMessage,
}: MessageListProps) {
  const { t, i18n } = useTranslation();
  const currentUserQuery = useCurrentUserQuery();
  const {
    messages,
    members,
    type,
    firstItemIndex,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useConversationMessages(conversationId);
  const currentUserId = currentUserQuery.data?.id;
  const isGroup = type === ChatConversationType.GROUP;
  const otherMember = members.find((member) => member.userId !== currentUserId);

  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  // The floating day badge (Telegram's shape): the day of the topmost visible
  // message, shown only while the list is actually moving.
  const [isScrolling, setIsScrolling] = useState(false);
  const [topVisibleIndex, setTopVisibleIndex] = useState(0);
  const topVisibleMessage = messages[topVisibleIndex];
  const { count: newMessageCount, reset: resetNewMessageCount } =
    useNewMessageIndicator(messages, isAtBottom);

  const avatarUrlBySenderId = useMemo(
    () => new Map(members.map((member) => [member.userId, member.avatarUrl])),
    [members],
  );
  const positions = useMemo(
    () => groupMessages(messages, currentUserId ?? ""),
    [messages, currentUserId],
  );
  // "Seen" belongs on the visitor's LAST own message in the whole thread —
  // never every earlier own group `isLastInGroup` also true for — so a
  // reply the other person read past doesn't light up every older run too.
  const lastOwnMessageId = useMemo(
    () =>
      [...messages]
        .reverse()
        .find((message) => message.senderId === currentUserId)?.id,
    [messages, currentUserId],
  );

  function scrollToBottom() {
    virtuosoRef.current?.scrollToIndex({
      index: "LAST",
      align: "end",
      behavior: "smooth",
    });
    resetNewMessageCount();
  }

  if (isLoading) {
    return (
      <div className="h-full">
        <MessageListSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6">
        <p className="text-muted-foreground text-sm">
          {t("chat.convPane.list.couldNotLoad")}
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          {t("chat.convPane.list.retry")}
        </Button>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-muted-foreground text-sm">
          {t("chat.convPane.empty.noMessagesYet")}
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      {/* Symmetric scrollbar gutters keep the rows centred on the same axis
          as the floating day badge below, which is centred over the whole
          scroller — without them the two sit half a scrollbar apart. */}
      <Virtuoso<Message>
        ref={virtuosoRef}
        className="[scrollbar-gutter:stable_both-edges]"
        alignToBottom
        followOutput="auto"
        initialTopMostItemIndex={{ index: "LAST", align: "end" }}
        data={messages}
        firstItemIndex={firstItemIndex}
        computeItemKey={(_, message) => message.id}
        atBottomStateChange={setIsAtBottom}
        isScrolling={setIsScrolling}
        rangeChanged={({ startIndex }) =>
          setTopVisibleIndex(startIndex - firstItemIndex)
        }
        startReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        itemContent={(index) => {
          const arrayIndex = index - firstItemIndex;
          const position = positions[arrayIndex];
          if (!position) return null;
          return (
            <MessageRow
              position={position}
              senderAvatarUrl={avatarUrlBySenderId.get(
                position.message.senderId,
              )}
              readers={
                isGroup && currentUserId
                  ? readersOf(
                      position.message,
                      positions[arrayIndex + 1]?.message,
                      members,
                      currentUserId,
                    )
                  : undefined
              }
              seenByOther={
                !isGroup &&
                position.message.id === lastOwnMessageId &&
                isSeenByOther(position.message, otherMember)
              }
              onEdit={onEditMessage}
            />
          );
        }}
      />
      {topVisibleMessage && (
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-x-0 top-2 flex justify-center transition-opacity duration-200",
            isScrolling ? "opacity-100" : "opacity-0",
          )}
        >
          <DateBadge>
            {formatMessageDateLabel(
              topVisibleMessage.createdAt,
              i18n.resolvedLanguage ?? defaultLanguage,
            )}
          </DateBadge>
        </div>
      )}
      <div
        aria-live="polite"
        className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center"
      >
        {newMessageCount > 0 && (
          <Button
            type="button"
            size="sm"
            className="bg-foreground text-background hover:bg-foreground/90 pointer-events-auto gap-1.5 rounded-full shadow-lg"
            onClick={scrollToBottom}
          >
            {t("chat.convPane.list.newMessagesButton", {
              count: newMessageCount,
            })}
            <ArrowDown className="size-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
