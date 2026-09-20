import { Inbox, Search, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";

import { Badge } from "@monorepo/ui/components/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@monorepo/ui/components/tabs";

import IslandBoundary from "~/components/exception/island-boundary";
import { FindPeopleSection } from "~/features/friends/components/find-people-section";
import { FriendRequestSection } from "~/features/friends/components/friend-request-section";
import { FriendsListSection } from "~/features/friends/components/friends-list-section";
import { friendQueryKeys, useFriendRequestsQuery } from "~/hooks/api/friend";

type FriendsTab = "friends" | "requests" | "find";
const DEFAULT_TAB: FriendsTab = "friends";
const TAB_PARAM = "tab";

function isFriendsTab(value: unknown): value is FriendsTab {
  return value === "friends" || value === "requests" || value === "find";
}

const TAB_CONTENT_CLASS_NAME = "min-h-0 flex-1 overflow-y-auto p-4 md:p-6";
/** The active tab wears `--foreground`, the same "where you are" mark the
 * conversation list's All·Unread·Groups chips and the Rail use (Islands,
 * ADR-0016) — a pill, not an underline. */
const TAB_TRIGGER_CLASS_NAME =
  "h-8 gap-1.5 rounded-full px-3 data-active:bg-foreground data-active:text-background data-active:shadow-none dark:data-active:border-transparent dark:data-active:bg-foreground";

/**
 * `Tabs` — Friends · Requests (badge) · Find people — with the active tab on
 * `?tab=`, so a link straight into Requests (the Rail/Bottom nav badge) or
 * Find people (the list's "Search people instead" empty state) lands on the
 * right body without a second click (brief §10 rows 12/21, stories 48–50).
 *
 * The screen fills its Island: a fixed header (title over a full-width line
 * tab strip) above a body that scrolls on its own.
 */
export default function FriendsTemplate() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get(TAB_PARAM);
  const activeTab = isFriendsTab(tabParam) ? tabParam : DEFAULT_TAB;

  const requestsQuery = useFriendRequestsQuery();
  const receivedCount = requestsQuery.data?.receivedRequests.length ?? 0;

  return (
    <IslandBoundary queryKey={friendQueryKeys.all}>
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          if (!isFriendsTab(value)) return;
          setSearchParams(value === DEFAULT_TAB ? {} : { [TAB_PARAM]: value }, {
            replace: true,
          });
        }}
        className="min-h-0 flex-1 gap-0"
      >
        <header className="border-border flex flex-col gap-3 border-b px-4 pt-4 pb-3 md:flex-row md:items-center md:justify-between md:px-6">
          <h1 className="text-xl font-semibold">{t("chat.friends.title")}</h1>
          <TabsList className="group-data-horizontal/tabs:h-10 w-full rounded-full p-1 md:w-fit">
            <TabsTrigger value="friends" className={TAB_TRIGGER_CLASS_NAME}>
              <Users />
              {t("chat.friends.tabs.friends")}
            </TabsTrigger>
            <TabsTrigger value="requests" className={TAB_TRIGGER_CLASS_NAME}>
              <Inbox />
              {t("chat.friends.tabs.requests")}
              {receivedCount > 0 && (
                <Badge className="bg-primary text-primary-foreground min-w-5 px-1.5">
                  {receivedCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="find" className={TAB_TRIGGER_CLASS_NAME}>
              <Search />
              {t("chat.friends.tabs.find")}
            </TabsTrigger>
          </TabsList>
        </header>

        <TabsContent value="friends" className={TAB_CONTENT_CLASS_NAME}>
          <FriendsListSection />
        </TabsContent>
        <TabsContent value="requests" className={TAB_CONTENT_CLASS_NAME}>
          <FriendRequestSection />
        </TabsContent>
        <TabsContent value="find" className={TAB_CONTENT_CLASS_NAME}>
          <FindPeopleSection />
        </TabsContent>
      </Tabs>
    </IslandBoundary>
  );
}
