import * as React from "react";
import { Loader2, Plus, Search, X } from "lucide-react";

import type { ChatFriendRecord } from "@monorepo/types/chat-friend";
import { useDebounce } from "@monorepo/hook/use-debounce";
import { Button } from "@monorepo/ui/components/button";
import { Input } from "@monorepo/ui/components/input";
import { Skeleton } from "@monorepo/ui/components/skeleton";
import { cn } from "@monorepo/ui/utils/cn";

import { ConversationAvatar } from "~/components/avatar/conversation-avatar";
import { useFriendsInfiniteQuery } from "~/hooks/api/friend";
import { getDisplayName } from "~/utils/display";

const SEARCH_DEBOUNCE_MS = 300;

interface GroupMemberPickerProps {
  /** Members already in the group — excluded from the pickable list. */
  disabledFriendIds?: ReadonlySet<string>;
  selectedFriendIds: readonly string[];
  onChange: (nextMemberIds: string[]) => void;
  error?: string;
}

/**
 * A self-fetching multi-select over the friend list (search + "Load more"),
 * built as a Controller-driven control so `~/features/group/hooks/use-create-
 * group-dialog.ts` and `add-group-members-dialog.tsx` both bind it with
 * `field.value`/`field.onChange` — see .agents/rules/forms-field-components.md.
 */
export function GroupMemberPicker({
  disabledFriendIds,
  selectedFriendIds,
  onChange,
  error,
}: GroupMemberPickerProps) {
  const searchInputId = React.useId();
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebounce(search.trim(), SEARCH_DEBOUNCE_MS);
  const isDebouncing = search.trim() !== debouncedSearch;
  const friendsQuery = useFriendsInfiniteQuery(debouncedSearch);
  const friends = isDebouncing ? [] : (friendsQuery.data ?? []);

  // Selected chips must keep showing a friend even after the search term
  // that surfaced them changes (or its page falls out of the cache), so this
  // accumulates every friend record ever seen for a currently-selected id.
  const [selectedById, setSelectedById] = React.useState<
    Map<string, ChatFriendRecord>
  >(new Map());
  const selectedIdSet = React.useMemo(
    () => new Set(selectedFriendIds),
    [selectedFriendIds],
  );

  React.useEffect(() => {
    setSelectedById((current) => {
      const next = new Map(current);
      for (const friend of friends) {
        if (selectedIdSet.has(friend.id)) next.set(friend.id, friend);
      }
      for (const id of current.keys()) {
        if (!selectedIdSet.has(id)) next.delete(id);
      }
      return next;
    });
  }, [friends, selectedIdSet]);

  const handleToggle = (friend: ChatFriendRecord) => {
    const next = new Set(selectedFriendIds);
    if (next.has(friend.id)) next.delete(friend.id);
    else next.add(friend.id);
    onChange(Array.from(next));
  };

  const handleRemove = (friendId: string) => {
    onChange(selectedFriendIds.filter((id) => id !== friendId));
  };

  return (
    <div className="grid gap-3">
      <label className="grid gap-1" htmlFor={searchInputId}>
        <span className="text-sm font-medium">Search friends</span>
        <div className="relative text-muted-foreground">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            id={searchInputId}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or username"
            type="search"
            className="h-10 pl-9"
          />
        </div>
      </label>

      {error ? <p className="text-destructive text-xs">{error}</p> : null}

      <div className="grid gap-2">
        <p className="text-muted-foreground text-xs font-medium">
          Selected members
        </p>
        {selectedFriendIds.length === 0 ? (
          <p className="text-muted-foreground text-sm">No members selected.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedFriendIds.map((friendId) => {
              const friend = selectedById.get(friendId);
              return (
                <span
                  key={friendId}
                  className="bg-muted inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs"
                >
                  {friend ? getDisplayName(friend) : friendId}
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    className="ml-1 size-5 rounded-full p-0.5"
                    onClick={() => handleRemove(friendId)}
                    aria-label={`Remove ${friend ? getDisplayName(friend) : "member"}`}
                  >
                    <X className="size-3" />
                  </Button>
                </span>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid max-h-64 gap-2 overflow-y-auto pr-1">
        {friendsQuery.isLoading || isDebouncing ? (
          <>
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
          </>
        ) : friendsQuery.isError ? (
          <div className="flex flex-col items-start gap-2">
            <p className="text-destructive text-sm">Unable to load friends.</p>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => friendsQuery.refetch()}
            >
              Retry
            </Button>
          </div>
        ) : friends.length === 0 ? (
          <p className="text-muted-foreground bg-muted/40 rounded-xl px-3 py-2.5 text-sm">
            {debouncedSearch
              ? "No friends match this search."
              : "No friends found."}
          </p>
        ) : (
          <ul className="grid gap-2">
            {friends.map((friend) => {
              const isDisabled = disabledFriendIds?.has(friend.id) ?? false;
              const isSelected = selectedIdSet.has(friend.id);
              const displayName = getDisplayName(friend);

              return (
                <li key={friend.id}>
                  <div
                    className={cn(
                      "hover:bg-accent flex min-h-14 items-center gap-2 rounded-xl px-2 py-1.5 transition-colors",
                      isSelected && "bg-primary/10 hover:bg-primary/10",
                      isDisabled && "opacity-60",
                    )}
                  >
                    <ConversationAvatar
                      title={displayName}
                      avatarUrl={friend.avatarUrl ?? undefined}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {displayName}
                      </p>
                      <p className="text-muted-foreground truncate text-xs">
                        @{friend.username}
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant={isSelected ? "secondary" : "default"}
                      className="shrink-0 rounded-full"
                      onClick={() => handleToggle(friend)}
                      disabled={isDisabled}
                      aria-label={
                        isSelected
                          ? `Remove ${displayName}`
                          : `Add ${displayName}`
                      }
                    >
                      {isSelected ? (
                        <X className="size-4" />
                      ) : (
                        <Plus className="size-4" />
                      )}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {friendsQuery.hasNextPage && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={friendsQuery.isFetchingNextPage}
            onClick={() => {
              if (
                friendsQuery.hasNextPage &&
                !friendsQuery.isFetchingNextPage
              ) {
                friendsQuery.fetchNextPage();
              }
            }}
          >
            {friendsQuery.isFetchingNextPage ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Load more"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
