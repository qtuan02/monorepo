import { Plus, Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@monorepo/ui/components/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@monorepo/ui/components/input-group";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@monorepo/ui/components/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@monorepo/ui/components/tooltip";

import type { ConversationListFilter } from "~/features/conversation/types/conversation";
import { isConversationListFilter } from "~/features/conversation/types/conversation";
import { PRIMARY_GRADIENT_CLASSNAME } from "~/features/conversation/utils/gradient-classnames";

interface ConversationListHeaderProps {
  filter: ConversationListFilter;
  onFilterChange: (next: ConversationListFilter) => void;
  search: string;
  onSearchChange: (next: string) => void;
  onNewGroup: () => void;
}

const CHIP_CLASSNAME =
  "rounded-full px-3 aria-pressed:bg-foreground aria-pressed:text-background";

/**
 * The title bar, search box and All·Unread·Groups chips — the list's own
 * chrome, with none of the data or filter-retention logic that owns it (see
 * ~/features/conversation/components/conversation-list.tsx). Kept separate
 * so that file changes for one reason (which rows are showing), not for
 * every reason this bar itself can change.
 *
 * The one action here is `+` → New group. Starting a direct message is the
 * search box's job: it finds people as well as chats (friend or not), so a
 * second "New message" entry would only duplicate it.
 */
export function ConversationListHeader({
  filter,
  onFilterChange,
  search,
  onSearchChange,
  onNewGroup,
}: ConversationListHeaderProps) {
  const { t } = useTranslation();
  const isSearching = search.trim().length > 0;

  return (
    <div className="flex flex-col gap-3 px-4 pt-4 pb-2">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">
          {t("chat.convList.chats")}
        </h2>
        <TooltipProvider delay={200}>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  size="icon"
                  aria-label={t("chat.convList.newGroup")}
                  onClick={onNewGroup}
                  className={`${PRIMARY_GRADIENT_CLASSNAME} text-primary-foreground shadow-primary/30 rounded-full shadow-md`}
                >
                  <Plus className="size-5" />
                </Button>
              }
            />
            <TooltipContent side="bottom">
              {t("chat.convList.newGroup")}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <InputGroup className="bg-muted/60 h-10 rounded-full border-transparent shadow-none focus-within:bg-background">
        <InputGroupAddon className="text-muted-foreground pl-1.5">
          <Search className="size-4" />
        </InputGroupAddon>
        <InputGroupInput
          type="search"
          placeholder={t("chat.convList.searchPlaceholder")}
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="[&::-webkit-search-cancel-button]:hidden"
        />
        {isSearching && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              type="button"
              size="icon-xs"
              variant="ghost"
              aria-label={t("chat.convList.clearSearch")}
              className="rounded-full"
              onClick={() => onSearchChange("")}
            >
              <X className="size-3.5" />
            </InputGroupButton>
          </InputGroupAddon>
        )}
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
        <ToggleGroupItem value="all" className={CHIP_CLASSNAME}>
          {t("chat.convList.filterAll")}
        </ToggleGroupItem>
        <ToggleGroupItem value="unread" className={CHIP_CLASSNAME}>
          {t("chat.convList.filterUnread")}
        </ToggleGroupItem>
        <ToggleGroupItem value="groups" className={CHIP_CLASSNAME}>
          {t("chat.convList.filterGroups")}
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
