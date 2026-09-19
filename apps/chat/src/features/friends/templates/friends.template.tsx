import { useSearchParams } from "react-router";

import { Badge } from "@monorepo/ui/components/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@monorepo/ui/components/tabs";

import { FindPeopleSection } from "~/features/friends/components/find-people-section";
import { FriendRequestSection } from "~/features/friends/components/friend-request-section";
import { FriendsListSection } from "~/features/friends/components/friends-list-section";
import { useFriendRequestsQuery } from "~/hooks/api/friend";

type FriendsTab = "friends" | "requests" | "find";
const DEFAULT_TAB: FriendsTab = "friends";
const TAB_PARAM = "tab";

function isFriendsTab(value: unknown): value is FriendsTab {
  return value === "friends" || value === "requests" || value === "find";
}

/**
 * `Tabs` — Friends · Requests (badge) · Find people — with the active tab on
 * `?tab=`, so a link straight into Requests (the Rail/Bottom nav badge) or
 * Find people (the list's "Search people instead" empty state) lands on the
 * right body without a second click (brief §10 rows 12/21, stories 48–50).
 */
export default function FriendsTemplate() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get(TAB_PARAM);
  const activeTab = isFriendsTab(tabParam) ? tabParam : DEFAULT_TAB;

  const requestsQuery = useFriendRequestsQuery();
  const receivedCount = requestsQuery.data?.receivedRequests.length ?? 0;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4 md:p-6">
        <h1 className="text-xl font-semibold">Friends</h1>

        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            if (!isFriendsTab(value)) return;
            setSearchParams(
              value === DEFAULT_TAB ? {} : { [TAB_PARAM]: value },
              { replace: true },
            );
          }}
        >
          <TabsList>
            <TabsTrigger value="friends">Friends</TabsTrigger>
            <TabsTrigger value="requests">
              Requests
              {receivedCount > 0 && (
                <Badge variant="secondary">{receivedCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="find">Find people</TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="pt-4">
            <FriendsListSection />
          </TabsContent>
          <TabsContent value="requests" className="pt-4">
            <FriendRequestSection />
          </TabsContent>
          <TabsContent value="find" className="pt-4">
            <FindPeopleSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
