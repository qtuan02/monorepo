"use client";

import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";

import { env } from "~/env";
import { getQueryClient } from "~/libs/query-client";

/**
 * Loaded through `next/dynamic` with `ssr: false` so the devtools land in their
 * own chunk, fetched only when the panel is actually mounted — the same shape
 * the Vite template's `React.lazy` gives it, and the reason the dependency can
 * stay a plain `dependency` without weighing on a production render.
 */
const ReactQueryDevtools = dynamic(
  () =>
    import("@tanstack/react-query-devtools").then(
      (mod) => mod.ReactQueryDevtools,
    ),
  { ssr: false },
);

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * The client boundary TanStack Query needs. It takes `children` as a prop, so
 * everything inside it stays a Server Component unless it says otherwise — the
 * provider is a client island wrapped *around* server output, not a switch that
 * turns the tree into client code.
 *
 * `getQueryClient()` (not `new QueryClient()`) is what keeps one client per
 * browser session and a throwaway one per server render.
 */
export function QueryProvider({ children }: QueryProviderProps) {
  const queryClient = getQueryClient();
  // Read from validated app config, not `process.env.NODE_ENV`: `local` is the
  // one environment the panel belongs in, and a preview deploy running a
  // production build of a non-local env should not ship it.
  const showDevtools = env.NEXT_PUBLIC_APP_ENV === "local";

  return (
    <QueryClientProvider client={queryClient}>
      {showDevtools && <ReactQueryDevtools initialIsOpen={false} />}
      {children}
    </QueryClientProvider>
  );
}
