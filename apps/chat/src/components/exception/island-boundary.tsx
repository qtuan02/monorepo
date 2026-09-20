import type { QueryKey } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";

import IslandFallback from "~/components/exception/island-fallback";

interface IslandBoundaryProps {
  /**
   * One query key, or several when an Island's content is fed by more than
   * one entity (e.g. the message pane resets both the conversation's
   * messages and the conversation list itself). A `QueryKey` is itself an
   * array, so a list of them is told apart from a single key by checking
   * whether its first element is an array too.
   */
  queryKey: QueryKey | QueryKey[];
  /** Passed straight to `ErrorBoundary` — e.g. `[conversationId]`, so
   * switching conversations clears a stale fallback with no click. */
  resetKeys?: unknown[];
  children: ReactNode;
}

function toQueryKeyList(queryKey: QueryKey | QueryKey[]): QueryKey[] {
  return Array.isArray(queryKey[0]) ? (queryKey as QueryKey[]) : [queryKey];
}

/**
 * One error boundary per Island (CONTEXT.md — Island fallback), scoped to
 * its own query cache rather than the whole app: `IslandFallback`'s Retry
 * resets exactly the Island's own query key(s) and remounts its content, so
 * a broken conversation pane doesn't reload the sidebar too.
 */
export default function IslandBoundary({
  queryKey,
  resetKeys,
  children,
}: IslandBoundaryProps) {
  const queryClient = useQueryClient();

  return (
    <ErrorBoundary
      FallbackComponent={IslandFallback}
      resetKeys={resetKeys}
      onReset={() => {
        for (const key of toQueryKeyList(queryKey)) {
          queryClient.resetQueries({ queryKey: key });
        }
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
