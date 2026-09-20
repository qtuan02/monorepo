import { UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";

import { FriendStatus } from "@monorepo/types/chat-friend";
import { Button } from "@monorepo/ui/components/button";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@monorepo/ui/components/item";
import { Skeleton } from "@monorepo/ui/components/skeleton";

import { ConversationAvatar } from "~/components/avatar/conversation-avatar";
import { useUserSearchInfiniteQuery } from "~/hooks/api/user";
import { useOpenDirectConversation } from "~/hooks/use-open-direct-conversation";
import { getDisplayName } from "~/utils/display";

interface PeopleSearchResultsProps {
  /** Already trimmed and debounced by the list — see conversation-list.tsx. */
  search: string;
}

/**
 * The "People" half of the list's search: every account matching the query,
 * friend or not — picking one lands on their Draft conversation (or the
 * existing one) exactly as the Message button on Friends does. Owns its own
 * query so the list itself fetches nothing extra until someone types.
 */
export default function PeopleSearchResults({
  search,
}: PeopleSearchResultsProps) {
  const { t } = useTranslation();
  const peopleQuery = useUserSearchInfiniteQuery(search);
  const openDirectConversation = useOpenDirectConversation();
  const people = (peopleQuery.data ?? []).filter(
    (person) => person.statusFriend !== FriendStatus.SELF,
  );

  if (peopleQuery.isLoading) {
    return (
      <div className="flex flex-col gap-1 px-2">
        <PersonRowSkeleton />
        <PersonRowSkeleton />
      </div>
    );
  }

  if (peopleQuery.isError) {
    return (
      <div className="flex items-center justify-between gap-2 px-4 py-2 text-sm">
        <span className="text-muted-foreground">
          {t("chat.convList.searchPeopleError")}
        </span>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => peopleQuery.refetch()}
        >
          {t("chat.convList.retry")}
        </Button>
      </div>
    );
  }

  if (people.length === 0) {
    return (
      <p className="text-muted-foreground px-4 py-2 text-sm">
        {t("chat.convList.noPeopleFound")}
      </p>
    );
  }

  return (
    <div className="flex flex-col">
      {people.map((person) => {
        const displayName = getDisplayName(person);
        return (
          <Item
            key={person.id}
            size="sm"
            render={<button type="button" />}
            className="hover:bg-accent mx-2 my-0.5 w-auto cursor-pointer rounded-xl text-left"
            onClick={() => openDirectConversation(person)}
          >
            <ItemMedia>
              <ConversationAvatar
                title={displayName}
                avatarUrl={person.avatarUrl ?? undefined}
                className="size-10"
              />
            </ItemMedia>
            <ItemContent className="min-w-0">
              <ItemTitle className="font-medium">{displayName}</ItemTitle>
              <ItemDescription className="line-clamp-1 wrap-anywhere">
                @{person.username}
              </ItemDescription>
            </ItemContent>
            {person.statusFriend !== FriendStatus.FRIEND && (
              <UserPlus
                aria-label={t("chat.convList.notFriendsYet")}
                className="text-muted-foreground size-4 shrink-0"
              />
            )}
          </Item>
        );
      })}
      {peopleQuery.hasNextPage && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="mx-auto my-1"
          disabled={peopleQuery.isFetchingNextPage}
          onClick={() => {
            if (peopleQuery.hasNextPage && !peopleQuery.isFetchingNextPage) {
              peopleQuery.fetchNextPage();
            }
          }}
        >
          {peopleQuery.isFetchingNextPage
            ? t("chat.convList.loading")
            : t("chat.convList.morePeople")}
        </Button>
      )}
    </div>
  );
}

function PersonRowSkeleton() {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5">
      <Skeleton className="size-10 shrink-0 rounded-full" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <Skeleton className="h-3.5 w-2/5" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  );
}
