import * as React from "react";
import { Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { FriendStatus } from "@monorepo/types/chat-friend";
import { Button, buttonVariants } from "@monorepo/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@monorepo/ui/components/empty";
import { ItemGroup } from "@monorepo/ui/components/item";
import { Skeleton } from "@monorepo/ui/components/skeleton";

import { UserItem } from "~/components/user-item";
import { ROUTES } from "~/constants/routes";
import { PEOPLE_GRID_CLASS_NAME } from "~/features/friends/constants/people-grid";
import {
  useFriendsInfiniteQuery,
  useRemoveFriendMutation,
} from "~/hooks/api/friend";
import { useOpenDirectConversation } from "~/hooks/use-open-direct-conversation";
import { useSocketStore } from "~/stores/use-socket-store";

/** The `Friends` tab body — see friends.template.tsx. */
export function FriendsListSection() {
  const { t } = useTranslation();
  const [processingFriendId, setProcessingFriendId] = React.useState<
    string | null
  >(null);
  const friendsQuery = useFriendsInfiniteQuery();
  const onlineUsers = useSocketStore((state) => state.onlineUsers);
  const openDirectConversation = useOpenDirectConversation();
  const removeFriendMutation = useRemoveFriendMutation();

  const friends = friendsQuery.data ?? [];

  const handleUnfriend = (friendId: string) => {
    if (removeFriendMutation.isPending) return;
    setProcessingFriendId(friendId);
    removeFriendMutation.mutate(friendId, {
      onSettled: () =>
        setProcessingFriendId((current) =>
          current === friendId ? null : current,
        ),
    });
  };

  if (friendsQuery.isLoading) {
    return (
      <div className={PEOPLE_GRID_CLASS_NAME}>
        <Skeleton className="h-15 rounded-md" />
        <Skeleton className="h-15 rounded-md" />
        <Skeleton className="h-15 rounded-md" />
      </div>
    );
  }

  if (friendsQuery.isError) {
    return (
      <div className="flex flex-col items-start gap-2">
        <p className="text-destructive text-sm">
          {t("chat.friends.list.error")}
        </p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => friendsQuery.refetch()}
        >
          {t("chat.friends.retry")}
        </Button>
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <Empty className="h-full">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Users />
          </EmptyMedia>
          <EmptyTitle>{t("chat.friends.list.emptyTitle")}</EmptyTitle>
          <EmptyDescription>
            {t("chat.friends.list.emptyDescription")}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link
            to={`${ROUTES.FRIENDS}?tab=find`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            {t("chat.friends.tabs.find")}
          </Link>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="grid gap-4">
      <ItemGroup className={PEOPLE_GRID_CLASS_NAME}>
        {friends.map((friend) => (
          <UserItem
            key={friend.id}
            user={friend}
            friendStatus={FriendStatus.FRIEND}
            online={onlineUsers.includes(friend.id)}
            isActionPending={processingFriendId === friend.id}
            onMessage={openDirectConversation}
            onUnfriend={handleUnfriend}
          />
        ))}
      </ItemGroup>

      {friendsQuery.hasNextPage && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="justify-self-center"
          disabled={friendsQuery.isFetchingNextPage}
          onClick={() => {
            if (friendsQuery.hasNextPage && !friendsQuery.isFetchingNextPage) {
              friendsQuery.fetchNextPage();
            }
          }}
        >
          {friendsQuery.isFetchingNextPage
            ? t("chat.friends.loadingMore")
            : t("chat.friends.loadMore")}
        </Button>
      )}
    </div>
  );
}
