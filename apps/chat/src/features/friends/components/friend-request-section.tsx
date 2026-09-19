import * as React from "react";

import { Button } from "@monorepo/ui/components/button";
import { ItemGroup } from "@monorepo/ui/components/item";
import { Skeleton } from "@monorepo/ui/components/skeleton";

import { FriendRequestRow } from "~/features/friends/components/friend-request-row";
import {
  useAcceptFriendRequestMutation,
  useCancelFriendRequestMutation,
  useDeclineFriendRequestMutation,
  useFriendRequestsQuery,
} from "~/hooks/api/friend";

function RequestListSkeleton() {
  return (
    <div className="grid gap-2">
      <Skeleton className="h-16 rounded-xl" />
      <Skeleton className="h-16 rounded-xl" />
    </div>
  );
}

/** The `Requests` tab body — see friends.template.tsx. */
export function FriendRequestSection() {
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
          Couldn't load friend requests.
        </p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => requestsQuery.refetch()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-2">
        <p className="text-muted-foreground px-1 text-xs font-medium tracking-wide uppercase">
          Received
        </p>
        {receivedRequests.length === 0 ? (
          <p className="text-muted-foreground text-sm">No received requests.</p>
        ) : (
          <ItemGroup>
            {receivedRequests.map((request) => (
              <FriendRequestRow
                key={request.id}
                requestId={request.id}
                requestUser={request.fromUser}
                variant="received"
                isProcessing={processingRequestId === request.id}
                onAccept={handleAccept}
                onDecline={handleDecline}
              />
            ))}
          </ItemGroup>
        )}
      </div>

      <div className="grid gap-2">
        <p className="text-muted-foreground px-1 text-xs font-medium tracking-wide uppercase">
          Sent
        </p>
        {sentRequests.length === 0 ? (
          <p className="text-muted-foreground text-sm">No sent requests.</p>
        ) : (
          <ItemGroup>
            {sentRequests.map((request) => (
              <FriendRequestRow
                key={request.id}
                requestId={request.id}
                requestUser={request.toUser}
                variant="sent"
                isProcessing={processingRequestId === request.id}
                onCancel={handleCancel}
              />
            ))}
          </ItemGroup>
        )}
      </div>
    </div>
  );
}
