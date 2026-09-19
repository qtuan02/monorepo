import * as React from "react";
import { Users } from "lucide-react";
import { useNavigate } from "react-router";
import { Virtuoso } from "react-virtuoso";

import { Button } from "@monorepo/ui/components/button";
import { Skeleton } from "@monorepo/ui/components/skeleton";

import type { Conversation } from "~/features/conversation/types/conversation";
import { ROUTES } from "~/constants/routes";
import { ConversationListSkeleton } from "~/features/conversation/components/conversation-list.skeleton";
import ConversationListItem from "~/features/conversation/components/conversation-list-item";
import { useConversationList } from "~/features/conversation/hooks/use-conversation-list";
import { CreateGroupDialog } from "~/features/group/components/create-group-dialog";

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
  const navigate = useNavigate();
  const [isCreateGroupOpen, setIsCreateGroupOpen] = React.useState(false);
  const {
    conversations,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useConversationList();

  const header = (
    <div className="border-border flex items-center justify-between border-b px-3 py-2">
      <h2 className="text-sm font-semibold">Chats</h2>
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        onClick={() => setIsCreateGroupOpen(true)}
        aria-label="New group"
      >
        <Users className="size-4" />
      </Button>
    </div>
  );

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      {header}

      {isLoading ? (
        <div className="min-h-0 flex-1 overflow-hidden">
          <ConversationListSkeleton />
        </div>
      ) : conversations.length === 0 ? (
        <div className="flex min-h-0 flex-1 items-center justify-center p-6">
          <p className="text-muted-foreground text-sm">
            No conversations to show.
          </p>
        </div>
      ) : (
        <div className="min-h-0 flex-1">
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
      )}

      <CreateGroupDialog
        open={isCreateGroupOpen}
        onOpenChange={setIsCreateGroupOpen}
        onCreated={(conversationId) =>
          navigate(ROUTES.conversationByIdPath(conversationId))
        }
      />
    </div>
  );
}
