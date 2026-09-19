import { useMemo, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";

import { ChatConversationType } from "@monorepo/types/chat-conversation";
import { Button } from "@monorepo/ui/components/button";

import type { Message } from "~/features/conversation/types/message";
import { MessageListSkeleton } from "~/features/conversation/components/message-list.skeleton";
import MessageRow from "~/features/conversation/components/message-row";
import { useConversationMessages } from "~/features/conversation/hooks/use-conversation-messages";
import { useNewMessageIndicator } from "~/features/conversation/hooks/use-new-message-indicator";
import { groupMessages } from "~/features/conversation/utils/group-messages";
import { isSeenByOther, readersOf } from "~/features/conversation/utils/readers-of";
import { useCurrentUserQuery } from "~/hooks/api/user";

interface MessageListProps {
  conversationId: string;
}

export default function MessageList({ conversationId }: MessageListProps) {
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
        <p className="text-muted-foreground text-sm">Couldn't load messages.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-muted-foreground text-sm">No messages yet.</p>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <Virtuoso<Message>
        ref={virtuosoRef}
        key={conversationId}
        alignToBottom
        followOutput="auto"
        initialTopMostItemIndex={{ index: "LAST", align: "end" }}
        data={messages}
        firstItemIndex={firstItemIndex}
        computeItemKey={(_, message) => message.id}
        atBottomStateChange={setIsAtBottom}
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
                  ? readersOf(position.message, members, currentUserId)
                  : undefined
              }
              seenByOther={
                !isGroup &&
                position.isOwn &&
                position.isLastInGroup &&
                isSeenByOther(position.message, otherMember)
              }
            />
          );
        }}
      />
      <div
        aria-live="polite"
        className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center"
      >
        {newMessageCount > 0 && (
          <Button
            type="button"
            size="sm"
            className="pointer-events-auto gap-1.5 rounded-full shadow-lg"
            onClick={scrollToBottom}
          >
            {newMessageCount} new message{newMessageCount === 1 ? "" : "s"}
            <ArrowDown className="size-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
