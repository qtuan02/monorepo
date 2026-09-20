import * as React from "react";
import { MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router";
import { Virtuoso } from "react-virtuoso";

import { useDebounce } from "@monorepo/hook/use-debounce";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@monorepo/ui/components/empty";
import { Skeleton } from "@monorepo/ui/components/skeleton";

import type {
  Conversation,
  ConversationListFilter,
} from "~/features/conversation/types/conversation";
import { ROUTES } from "~/constants/routes";
import { ConversationListSkeleton } from "~/features/conversation/components/conversation-list.skeleton";
import { ConversationListHeader } from "~/features/conversation/components/conversation-list-header";
import ConversationListItem from "~/features/conversation/components/conversation-list-item";
import PeopleSearchResults from "~/features/conversation/components/people-search-results";
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

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground px-4 pt-3 pb-1 text-xs font-semibold tracking-wide uppercase">
      {children}
    </p>
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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isCreateGroupOpen, setIsCreateGroupOpen] = React.useState(false);
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

  let body: React.ReactNode;
  if (isLoading) {
    body = (
      <div className="min-h-0 flex-1 overflow-hidden">
        <ConversationListSkeleton />
      </div>
    );
  } else if (debouncedSearch) {
    // Two sections, not a Virtuoso: a query narrows the loaded chats to a
    // handful, and the People half is its own paginated query.
    body = (
      <div className="min-h-0 flex-1 overflow-y-auto pb-2">
        {visibleConversations.length > 0 && (
          <>
            <SectionHeading>{t("chat.convList.chats")}</SectionHeading>
            {visibleConversations.map((conversation) => (
              <ConversationListItem
                key={conversation.id}
                conversation={conversation}
                active={conversation.id === activeConversationId}
              />
            ))}
          </>
        )}
        <SectionHeading>{t("chat.convList.people")}</SectionHeading>
        <PeopleSearchResults search={debouncedSearch} />
      </div>
    );
  } else if (conversations.length === 0) {
    body = (
      <div className="flex min-h-0 flex-1 items-center justify-center p-6">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MessageCircle />
            </EmptyMedia>
            <EmptyTitle>{t("chat.convList.emptyTitle")}</EmptyTitle>
            <EmptyDescription>
              {t("chat.convList.emptyDescription")}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  } else if (visibleConversations.length === 0) {
    body = (
      <div className="flex min-h-0 flex-1 items-center justify-center p-6">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MessageCircle />
            </EmptyMedia>
            <EmptyTitle>{t("chat.convList.emptyFilterTitle")}</EmptyTitle>
          </EmptyHeader>
        </Empty>
      </div>
    );
  } else {
    body = (
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
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <ConversationListHeader
        filter={filter}
        onFilterChange={setFilter}
        search={search}
        onSearchChange={setSearch}
        onNewGroup={() => setIsCreateGroupOpen(true)}
      />

      {body}

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
