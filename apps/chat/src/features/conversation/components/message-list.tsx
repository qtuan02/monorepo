import { Virtuoso } from "react-virtuoso";

import { Button } from "@monorepo/ui/components/button";

import type { Message } from "~/features/conversation/types/message";
import { MessageListSkeleton } from "~/features/conversation/components/message-list.skeleton";
import MessageRow from "~/features/conversation/components/message-row";
import { useConversationMessages } from "~/features/conversation/hooks/use-conversation-messages";
import { useCurrentUserQuery } from "~/hooks/api/user";

interface MessageListProps {
  conversationId: string;
}

export default function MessageList({ conversationId }: MessageListProps) {
  const currentUserQuery = useCurrentUserQuery();
  const {
    messages,
    firstItemIndex,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useConversationMessages(conversationId);

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

  const currentUserId = currentUserQuery.data?.id;

  return (
    <div className="h-full">
      <Virtuoso<Message>
        key={conversationId}
        alignToBottom
        followOutput="auto"
        initialTopMostItemIndex={{ index: "LAST", align: "end" }}
        data={messages}
        firstItemIndex={firstItemIndex}
        computeItemKey={(_, message) => message.id}
        startReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        itemContent={(index, message) => {
          const arrayIndex = index - firstItemIndex;
          return (
            <MessageRow
              message={message}
              previousMessage={messages[arrayIndex - 1]}
              isOwn={message.senderId === currentUserId}
            />
          );
        }}
      />
    </div>
  );
}
