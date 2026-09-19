import { Plus, Search } from "lucide-react";

import { Button } from "@monorepo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@monorepo/ui/components/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@monorepo/ui/components/input-group";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@monorepo/ui/components/toggle-group";

import type { ConversationListFilter } from "~/features/conversation/types/conversation";
import { isConversationListFilter } from "~/features/conversation/types/conversation";

interface ConversationListHeaderProps {
  filter: ConversationListFilter;
  onFilterChange: (next: ConversationListFilter) => void;
  search: string;
  onSearchChange: (next: string) => void;
  onNewMessage: () => void;
  onNewGroup: () => void;
}

/**
 * The title bar, search box and All·Unread·Groups chips — the list's own
 * chrome, with none of the data or filter-retention logic that owns it (see
 * ~/features/conversation/components/conversation-list.tsx). Kept separate
 * so that file changes for one reason (which rows are showing), not for
 * every reason this bar itself can change.
 */
export function ConversationListHeader({
  filter,
  onFilterChange,
  search,
  onSearchChange,
  onNewMessage,
  onNewGroup,
}: ConversationListHeaderProps) {
  return (
    <div className="border-border flex flex-col gap-2 border-b px-3 py-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Chats</h2>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                size="icon-sm"
                aria-label="New"
                className="from-primary to-primary/70 text-primary-foreground shadow-primary/30 bg-gradient-to-br shadow-sm"
              >
                <Plus className="size-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onNewMessage}>
              New message
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onNewGroup}>New group</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <InputGroup>
        <InputGroupInput
          placeholder="Search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
        <InputGroupAddon>
          <Search className="size-4" />
        </InputGroupAddon>
      </InputGroup>

      <ToggleGroup
        variant="outline"
        size="sm"
        value={[filter]}
        // Base UI's ToggleGroup unpresses a re-clicked item down to an empty
        // array — never let this segmented control land on "no chip active".
        onValueChange={(next) => {
          const [nextFilter] = next;
          if (isConversationListFilter(nextFilter)) {
            onFilterChange(nextFilter);
          }
        }}
      >
        <ToggleGroupItem value="all">All</ToggleGroupItem>
        <ToggleGroupItem value="unread">Unread</ToggleGroupItem>
        <ToggleGroupItem value="groups">Groups</ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
