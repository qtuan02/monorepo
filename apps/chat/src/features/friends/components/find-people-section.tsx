import * as React from "react";
import { Search } from "lucide-react";

import { useDebounce } from "@monorepo/hook/use-debounce";
import { Button } from "@monorepo/ui/components/button";
import { Input } from "@monorepo/ui/components/input";
import { Skeleton } from "@monorepo/ui/components/skeleton";

import { UserItem } from "~/components/user-item";
import { useOpenDirectConversation } from "~/hooks/api/conversation";
import {
  useCancelFriendRequestMutation,
  useSendFriendRequestMutation,
} from "~/hooks/api/friend";
import { useUserSearchInfiniteQuery } from "~/hooks/api/user";

const SEARCH_DEBOUNCE_MS = 500;

export function FindPeopleSection() {
  const searchInputId = React.useId();
  const [search, setSearch] = React.useState("");
  const [processingUserId, setProcessingUserId] = React.useState<string | null>(
    null,
  );
  const trimmedSearch = search.trim();
  const debouncedSearch = useDebounce(trimmedSearch, SEARCH_DEBOUNCE_MS);
  const isDebouncing = trimmedSearch !== debouncedSearch;

  const searchQuery = useUserSearchInfiniteQuery(debouncedSearch);
  const openDirectConversation = useOpenDirectConversation();
  const sendRequestMutation = useSendFriendRequestMutation();
  const cancelRequestMutation = useCancelFriendRequestMutation();

  const isBusy =
    sendRequestMutation.isPending || cancelRequestMutation.isPending;

  const handleSendRequest = (userId: string) => {
    if (isBusy) return;
    setProcessingUserId(userId);
    sendRequestMutation.mutate(
      { toUserId: userId },
      {
        onSettled: () =>
          setProcessingUserId((current) =>
            current === userId ? null : current,
          ),
      },
    );
  };

  const handleCancelRequest = (requestId: string, userId: string) => {
    if (isBusy) return;
    setProcessingUserId(userId);
    cancelRequestMutation.mutate(
      { requestId },
      {
        onSettled: () =>
          setProcessingUserId((current) =>
            current === userId ? null : current,
          ),
      },
    );
  };

  const results = isDebouncing ? [] : (searchQuery.data ?? []);
  const isLoading = isDebouncing || searchQuery.isLoading;

  return (
    <section className="border-border rounded-xl border">
      <div className="border-border border-b px-4 py-3">
        <h2 className="text-base font-semibold">Find people</h2>
        <p className="text-muted-foreground text-xs">
          Search by name or username to add a friend or start a chat.
        </p>
        <label
          className="relative mt-3 block text-muted-foreground"
          htmlFor={searchInputId}
        >
          <span className="sr-only">Search users</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            id={searchInputId}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or username"
            type="search"
            className="h-10 pl-9"
          />
        </label>
      </div>

      <div className="grid gap-3 p-4">
        {trimmedSearch.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Type a name or username to search.
          </p>
        ) : isLoading ? (
          <div className="grid gap-2">
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
          </div>
        ) : searchQuery.isError ? (
          <div className="flex flex-col items-start gap-2">
            <p className="text-destructive text-sm">Couldn't search users.</p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => searchQuery.refetch()}
            >
              Retry
            </Button>
          </div>
        ) : results.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No users match this search.
          </p>
        ) : (
          <ul className="grid gap-2">
            {results.map((result) => (
              <UserItem
                key={result.id}
                user={result}
                friendStatus={result.statusFriend}
                requestId={result.requestId}
                isActionPending={processingUserId === result.id}
                onMessage={openDirectConversation}
                onSendRequest={handleSendRequest}
                onCancelRequest={
                  result.requestId
                    ? (requestId) => handleCancelRequest(requestId, result.id)
                    : undefined
                }
              />
            ))}
          </ul>
        )}

        {searchQuery.hasNextPage && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={searchQuery.isFetchingNextPage}
            onClick={() => {
              if (searchQuery.hasNextPage && !searchQuery.isFetchingNextPage) {
                searchQuery.fetchNextPage();
              }
            }}
          >
            {searchQuery.isFetchingNextPage ? "Loading..." : "Load more"}
          </Button>
        )}
      </div>
    </section>
  );
}
