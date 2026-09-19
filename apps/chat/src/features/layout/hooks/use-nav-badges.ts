import { useConversationsInfiniteQuery } from "~/hooks/api/conversation";
import { useFriendRequestsQuery } from "~/hooks/api/friend";

/**
 * The Rail's and the Bottom nav's badges, both derived from a query already
 * in the cache elsewhere (React Query dedupes by key — see
 * .agents/rules/patterns-parallel-fetching.md) rather than a fetch of their
 * own. Counts, not sums: how many conversations have anything unread, not
 * how many messages (brief §10 row 17). Keyed the same way
 * `useNavActiveSection` and `NAV_ITEMS` are, so both nav shells can index
 * the same map by `item.key`.
 */
export function useNavBadges() {
  const conversationsQuery = useConversationsInfiniteQuery();
  const friendRequestsQuery = useFriendRequestsQuery();

  const chats = (conversationsQuery.data ?? []).filter(
    (conversation) => conversation.unreadCount > 0,
  ).length;
  const friends = friendRequestsQuery.data?.receivedRequests.length ?? 0;

  return { chats, friends, profile: 0 };
}
