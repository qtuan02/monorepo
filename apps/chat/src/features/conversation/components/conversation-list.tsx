import { Virtuoso } from "react-virtuoso";

import { Skeleton } from "@monorepo/ui/components/skeleton";

import type { Conversation } from "~/features/conversation/types/conversation";
import { ConversationListSkeleton } from "~/features/conversation/components/conversation-list.skeleton";
import ConversationListItem from "~/features/conversation/components/conversation-list-item";
import { useConversationList } from "~/features/conversation/hooks/use-conversation-list";

interface FooterContext {
  isFetchingNextPage: boolean;
}

// Reads state through Virtuoso's `context` prop rather than a module-scope
// variable mutated during render — the latter is exactly the kind of side
// effect that makes the React Compiler bail out of memoizing this tree.
function ConversationListFooter({ context }: { context?: FooterContext }) {
  if (!context?.isFetchingNextPage) return null;
  return (
    <div className="px-3 py-3">
      <Skeleton className="mx-auto h-3 w-24 rounded-full" />
    </div>
  );
}

interface ConversationListProps {
  activeConversationId?: string;
}

export default function ConversationList({
  activeConversationId,
}: ConversationListProps) {
  const {
    conversations,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useConversationList();

  if (isLoading) {
    return (
      <div className="h-full min-h-0 flex-1 overflow-hidden">
        <ConversationListSkeleton />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex h-full flex-1 items-center justify-center p-6">
        <p className="text-muted-foreground text-sm">
          No conversations to show.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 flex-1">
      <Virtuoso<Conversation, FooterContext>
        data={conversations}
        context={{ isFetchingNextPage }}
        endReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        computeItemKey={(_, conversation) => conversation.id}
        itemContent={(_, conversation) => (
          <ConversationListItem
            conversation={conversation}
            active={conversation.id === activeConversationId}
          />
        )}
        components={{ Footer: ConversationListFooter }}
      />
    </div>
  );
}
