import * as React from "react";

import { Button } from "@monorepo/ui/components/button";
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

  return (
    <section className="border-border rounded-xl border">
      <div className="border-border border-b px-4 py-3">
        <h2 className="text-base font-semibold">Friend requests</h2>
        <p className="text-muted-foreground text-xs">
          Review incoming and outgoing friend requests.
        </p>
      </div>

      <div className="grid gap-5 p-4">
        {requestsQuery.isLoading ? (
          <RequestListSkeleton />
        ) : requestsQuery.isError ? (
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
        ) : (
          <>
            <div className="grid gap-2">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Received
              </p>
              {receivedRequests.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No received requests.
                </p>
              ) : (
                <ul className="grid gap-2">
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
                </ul>
              )}
            </div>

            <div className="grid gap-2">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Sent
              </p>
              {sentRequests.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No sent requests.
                </p>
              ) : (
                <ul className="grid gap-2">
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
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
