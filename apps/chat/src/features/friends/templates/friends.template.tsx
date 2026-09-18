import { FindPeopleSection } from "~/features/friends/components/find-people-section";
import { FriendRequestSection } from "~/features/friends/components/friend-request-section";
import { FriendsListSection } from "~/features/friends/components/friends-list-section";

export default function FriendsTemplate() {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4 md:p-6">
        <h1 className="text-xl font-semibold">Friends</h1>
        <FindPeopleSection />
        <FriendRequestSection />
        <FriendsListSection />
      </div>
    </div>
  );
}
