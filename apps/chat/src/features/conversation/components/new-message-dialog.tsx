import * as React from "react";

import { useDebounce } from "@monorepo/hook/use-debounce";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@monorepo/ui/components/command";

import { ConversationAvatar } from "~/components/avatar/conversation-avatar";
import { useOpenDirectConversation } from "~/hooks/api/conversation";
import { useFriendsInfiniteQuery } from "~/hooks/api/friend";
import { getDisplayName } from "~/utils/display";

const SEARCH_DEBOUNCE_MS = 300;

interface NewMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * The "+" menu's New message: search a friend by name, pick one, land on
 * their Draft conversation the same way the Message button on Friends does
 * (`useOpenDirectConversation`) — one jump, no detour through that page
 * (T2, brief §10 row 23).
 */
export function NewMessageDialog({
  open,
  onOpenChange,
}: NewMessageDialogProps) {
  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="New message"
      description="Search a friend to start a direct message."
    >
      {/* CommandDialog is only the Dialog — the cmdk root only exists while
          `open` is true, so the friend search fetches on mount, not on every
          keystroke of whatever opened this (see .agents/rules/patterns-fetch-on-mount.md). */}
      {open && <NewMessageResults onOpenChange={onOpenChange} />}
    </CommandDialog>
  );
}

function NewMessageResults({
  onOpenChange,
}: {
  onOpenChange: (open: boolean) => void;
}) {
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebounce(search.trim(), SEARCH_DEBOUNCE_MS);
  const isDebouncing = search.trim() !== debouncedSearch;
  const friendsQuery = useFriendsInfiniteQuery(debouncedSearch);
  const openDirectConversation = useOpenDirectConversation();
  const friends = isDebouncing ? [] : (friendsQuery.data ?? []);

  return (
    // The list is already server-filtered by `debouncedSearch` — cmdk's own
    // substring filter would otherwise match the typed text against each
    // item's `value`, which carries no display text worth matching against.
    <Command shouldFilter={false}>
      <CommandInput
        placeholder="Search friends..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        {friendsQuery.isLoading || isDebouncing ? (
          <CommandEmpty>Loading...</CommandEmpty>
        ) : friends.length === 0 ? (
          <CommandEmpty>No friends found.</CommandEmpty>
        ) : (
          <CommandGroup heading="Friends">
            {friends.map((friend) => {
              const displayName = getDisplayName(friend);
              return (
                <CommandItem
                  key={friend.id}
                  value={friend.id}
                  onSelect={() => {
                    onOpenChange(false);
                    openDirectConversation(friend);
                  }}
                >
                  <ConversationAvatar
                    title={displayName}
                    avatarUrl={friend.avatarUrl ?? undefined}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {displayName}
                    </span>
                    <span className="text-muted-foreground block truncate text-xs">
                      @{friend.username}
                    </span>
                  </span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  );
}
