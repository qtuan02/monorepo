import * as React from "react";
import { useTranslation } from "react-i18next";

import { FriendStatus } from "@monorepo/types/chat-friend";
import { Button } from "@monorepo/ui/components/button";
import { ItemGroup } from "@monorepo/ui/components/item";
import { Skeleton } from "@monorepo/ui/components/skeleton";

import { UserItem } from "~/components/user-item";
import { PEOPLE_GRID_CLASS_NAME } from "~/features/friends/constants/people-grid";
import {
  useAcceptFriendRequestMutation,
  useCancelFriendRequestMutation,
  useDeclineFriendRequestMutation,
  useFriendRequestsQuery,
} from "~/hooks/api/friend";

function RequestListSkeleton() {
  return (
    <div className={PEOPLE_GRID_CLASS_NAME}>
      <Skeleton className="h-15 rounded-md" />
      <Skeleton className="h-15 rounded-md" />
    </div>
  );
}

function RequestGroup({
  title,
  count,
  emptyText,
  children,
}: {
  title: string;
  count: number;
  emptyText: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-3">
      <h2 className="text-muted-foreground flex items-center gap-2 text-xs font-medium tracking-wide uppercase">
        {title}
        <span className="bg-muted text-foreground rounded-full px-1.5 py-px text-[11px] tabular-nums">
          {count}
        </span>
      </h2>
      {count === 0 ? (
        <p className="text-muted-foreground text-sm">{emptyText}</p>
      ) : (
        <ItemGroup className={PEOPLE_GRID_CLASS_NAME}>{children}</ItemGroup>
      )}
    </section>
  );
}

/** The `Requests` tab body — see friends.template.tsx. */
export function FriendRequestSection() {
  const { t } = useTranslation();
  const [processingRequestId, setProcessingRequestId] = React.useState<
    string | null
  >(null);
  const requestsQuery = useFriendRequestsQuery();

  const clearProcessing = (requestId: string) => {
    setProcessingRequestId((current) =>
      current === requestId ? null : current,
    );
  };

  const acceptMutation = useAcceptFriendRequestMutation();
  const declineMutation = useDeclineFriendRequestMutation();
  const cancelMutation = useCancelFriendRequestMutation();

  const isBusy =
    acceptMutation.isPending ||
    declineMutation.isPending ||
    cancelMutation.isPending;

  function act(
    requestId: string,
    mutate: (payload: { requestId: string }) => void,
  ) {
    if (isBusy) return;
    setProcessingRequestId(requestId);
    mutate({ requestId });
  }

  const handleAccept = (requestId: string) =>
    act(requestId, (payload) =>
      acceptMutation.mutate(payload, {
        onSettled: () => clearProcessing(requestId),
      }),
    );
  const handleDecline = (requestId: string) =>
    act(requestId, (payload) =>
      declineMutation.mutate(payload, {
        onSettled: () => clearProcessing(requestId),
      }),
    );
  const handleCancel = (requestId: string) =>
    act(requestId, (payload) =>
      cancelMutation.mutate(payload, {
        onSettled: () => clearProcessing(requestId),
      }),
    );

  const receivedRequests = requestsQuery.data?.receivedRequests ?? [];
  const sentRequests = requestsQuery.data?.sentRequests ?? [];

  if (requestsQuery.isLoading) return <RequestListSkeleton />;

  if (requestsQuery.isError) {
    return (
      <div className="flex flex-col items-start gap-2">
        <p className="text-destructive text-sm">
          {t("chat.friends.requests.error")}
        </p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => requestsQuery.refetch()}
        >
          {t("chat.friends.retry")}
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <RequestGroup
        title={t("chat.friends.requests.received")}
        count={receivedRequests.length}
        emptyText={t("chat.friends.requests.noReceived")}
      >
        {receivedRequests.map((request) => (
          <UserItem
            key={request.id}
            user={request.fromUser}
            friendStatus={FriendStatus.RECEIVED}
            requestId={request.id}
            isActionPending={processingRequestId === request.id}
            onAccept={handleAccept}
            onDecline={handleDecline}
          />
        ))}
      </RequestGroup>

      <RequestGroup
        title={t("chat.friends.requests.sent")}
        count={sentRequests.length}
        emptyText={t("chat.friends.requests.noSent")}
      >
        {sentRequests.map((request) => (
          <UserItem
            key={request.id}
            user={request.toUser}
            friendStatus={FriendStatus.SENT}
            requestId={request.id}
            isActionPending={processingRequestId === request.id}
            onCancelRequest={handleCancel}
          />
        ))}
      </RequestGroup>
    </div>
  );
}
