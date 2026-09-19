import * as React from "react";
import { MessageCircle, Search } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Virtuoso } from "react-virtuoso";

import { useDebounce } from "@monorepo/hook/use-debounce";
import { Button, buttonVariants } from "@monorepo/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@monorepo/ui/components/empty";
import { Skeleton } from "@monorepo/ui/components/skeleton";
import { cn } from "@monorepo/ui/utils/cn";

import type {
  Conversation,
  ConversationListFilter,
} from "~/features/conversation/types/conversation";
import { ROUTES } from "~/constants/routes";
import { ConversationListSkeleton } from "~/features/conversation/components/conversation-list.skeleton";
import { ConversationListHeader } from "~/features/conversation/components/conversation-list-header";
import ConversationListItem from "~/features/conversation/components/conversation-list-item";
import { NewMessageDialog } from "~/features/conversation/components/new-message-dialog";
import { useConversationList } from "~/features/conversation/hooks/use-conversation-list";
import { isConversationListFilter } from "~/features/conversation/types/conversation";
import { filterConversations } from "~/features/conversation/utils/filter-conversations";
import { CreateGroupDialog } from "~/features/group/components/create-group-dialog";

const FILTER_PARAM = "filter";
const SEARCH_DEBOUNCE_MS = 300;

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

/** The list's `?filter=` chip — `all` is the default and stays off the URL. */
function useConversationListFilterParam(): [
  ConversationListFilter,
  (next: ConversationListFilter) => void,
] {
  const [searchParams, setSearchParams] = useSearchParams();
  const raw = searchParams.get(FILTER_PARAM);
  const filter = isConversationListFilter(raw) ? raw : "all";

  const setFilter = (next: ConversationListFilter) =>
    setSearchParams(
      (previous) => {
        const params = new URLSearchParams(previous);
        if (next === "all") params.delete(FILTER_PARAM);
        else params.set(FILTER_PARAM, next);
        return params;
      },
      { replace: true },
    );

  return [filter, setFilter];
}

interface ConversationListProps {
  activeConversationId?: string;
}

export default function ConversationList({
  activeConversationId,
}: ConversationListProps) {
  const navigate = useNavigate();
  const [isCreateGroupOpen, setIsCreateGroupOpen] = React.useState(false);
  const [isNewMessageOpen, setIsNewMessageOpen] = React.useState(false);
  const [filter, setFilter] = useConversationListFilterParam();
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebounce(search.trim(), SEARCH_DEBOUNCE_MS);

  const {
    conversations,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useConversationList(filter);

  // Snapshots which rows counted as unread the moment the visitor enters the
  // Unread chip, adjusting state during render rather than in an effect (see
  // .agents/rules/react-effects-sync-only.md) — React re-renders once more
  // before anything commits, so no extra fetch or flash of stale content.
  const [committedFilter, setCommittedFilter] =
    React.useState<ConversationListFilter>(filter);
  const [keptUnreadIds, setKeptUnreadIds] = React.useState<ReadonlySet<string>>(
    new Set(),
  );
  if (filter !== committedFilter) {
    setCommittedFilter(filter);
    if (filter === "unread") {
      setKeptUnreadIds(
        new Set(
          conversations
            .filter((conversation) => conversation.unreadCount > 0)
            .map((conversation) => conversation.id),
        ),
      );
    }
  }

  const visibleConversations = filterConversations(conversations, {
    search: debouncedSearch,
    filter,
    keptUnreadIds,
  });
  const hasNoSearchResults =
    conversations.length > 0 && visibleConversations.length === 0;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <ConversationListHeader
        filter={filter}
        onFilterChange={setFilter}
        search={search}
        onSearchChange={setSearch}
        onNewMessage={() => setIsNewMessageOpen(true)}
        onNewGroup={() => setIsCreateGroupOpen(true)}
      />

      {isLoading ? (
        <div className="min-h-0 flex-1 overflow-hidden">
          <ConversationListSkeleton />
        </div>
      ) : conversations.length === 0 ? (
        <div className="flex min-h-0 flex-1 items-center justify-center p-6">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MessageCircle />
              </EmptyMedia>
              <EmptyTitle>No conversations yet</EmptyTitle>
              <EmptyDescription>
                Start a direct message with a friend to see it here.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button type="button" onClick={() => setIsNewMessageOpen(true)}>
                New message
              </Button>
            </EmptyContent>
          </Empty>
        </div>
      ) : hasNoSearchResults ? (
        <div className="flex min-h-0 flex-1 items-center justify-center p-6">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Search />
              </EmptyMedia>
              <EmptyTitle>
                {debouncedSearch
                  ? `No results for '${debouncedSearch}'`
                  : "No conversations match this filter"}
              </EmptyTitle>
            </EmptyHeader>
            {debouncedSearch && (
              <EmptyContent>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSearch("")}
                >
                  Clear search
                </Button>
                {/* A styled Link, not `Button render={<Link/>}` — Base UI's
                    Button assumes a native `<button>` (see
                    .agents/rules/architecture-ui-primitives.md). */}
                <Link
                  to={`${ROUTES.FRIENDS}?tab=find`}
                  className={cn(buttonVariants({ variant: "link" }))}
                >
                  Search people instead →
                </Link>
              </EmptyContent>
            )}
          </Empty>
        </div>
      ) : (
        <div className="min-h-0 flex-1">
          <Virtuoso<Conversation, FooterContext>
            data={visibleConversations}
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
      <NewMessageDialog
        open={isNewMessageOpen}
        onOpenChange={setIsNewMessageOpen}
      />
    </div>
  );
}
