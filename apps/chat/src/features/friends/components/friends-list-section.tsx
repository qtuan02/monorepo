import * as React from "react";

import { FriendStatus } from "@monorepo/types/chat-friend";
import { Button } from "@monorepo/ui/components/button";
import { ItemGroup } from "@monorepo/ui/components/item";
import { Skeleton } from "@monorepo/ui/components/skeleton";

import { UserItem } from "~/components/user-item";
import { useOpenDirectConversation } from "~/hooks/api/conversation";
import {
  useFriendsInfiniteQuery,
  useRemoveFriendMutation,
} from "~/hooks/api/friend";
import { useSocketStore } from "~/stores/use-socket-store";

/** The `Friends` tab body — see friends.template.tsx. */
export function FriendsListSection() {
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

  return (
    <div className="grid gap-3">
      {friendsQuery.isLoading ? (
        <div className="grid gap-2">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
      ) : friendsQuery.isError ? (
        <div className="flex flex-col items-start gap-2">
          <p className="text-destructive text-sm">Couldn't load friends.</p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => friendsQuery.refetch()}
          >
            Retry
          </Button>
        </div>
      ) : friends.length === 0 ? (
        <p className="text-muted-foreground text-sm">No friends added yet.</p>
      ) : (
        <ItemGroup>
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
      )}

      {friendsQuery.hasNextPage && (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={friendsQuery.isFetchingNextPage}
          onClick={() => {
            if (friendsQuery.hasNextPage && !friendsQuery.isFetchingNextPage) {
              friendsQuery.fetchNextPage();
            }
          }}
        >
          {friendsQuery.isFetchingNextPage ? "Loading..." : "Load more"}
        </Button>
      )}
    </div>
  );
}
