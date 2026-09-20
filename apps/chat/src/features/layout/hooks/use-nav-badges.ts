import { useConversationsInfiniteQuery } from "~/hooks/api/conversation";
import { useFriendRequestsQuery } from "~/hooks/api/friend";

/**
 * The Rail's and the Bottom nav's badges. Both read the cache only —
 * `enabled: false` subscribes an observer without ever firing the fetch —
 * because the nav is mounted on every screen and must not be the reason
 * `/friends` loads the conversation list or `/` loads the request queue
 * (see .agents/rules/patterns-fetch-on-mount.md). The screen that owns a
 * list fetches it; the badge shows up once that screen has been visited,
 * and the socket patches keep it live from there. Counts, not sums: how
 * many conversations have anything unread, not how many messages (brief
 * §10 row 17). Keyed the same way `useNavActiveSection` and `NAV_ITEMS`
 * are, so both nav shells can index the same map by `item.key`.
 */
export function useNavBadges() {
  const conversationsQuery = useConversationsInfiniteQuery(undefined, {
    enabled: false,
  });
  const friendRequestsQuery = useFriendRequestsQuery({ enabled: false });

  const chats = (conversationsQuery.data ?? []).filter(
    (conversation) => conversation.unreadCount > 0,
  ).length;
  const friends = friendRequestsQuery.data?.receivedRequests.length ?? 0;

  return { chats, friends, profile: 0 };
}
