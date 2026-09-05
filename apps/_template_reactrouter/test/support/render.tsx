import type { ReactElement, ReactNode } from "react";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render as rtlRender } from "@testing-library/react";

/**
 * The test's own client, never the app's: `getQueryClient()` retries once, and a
 * test asserting an error branch would sit through that retry before the branch
 * ever appeared.
 */
function makeTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

/**
 * One client per rendered tree, held with `useState` for the same reason
 * `root.tsx`'s `Layout` does: a `new QueryClient()` written in a render body
 * hands the tree an empty cache again on every re-render, so a component that
 * re-renders while fetching would restart its query forever.
 */
function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(makeTestQueryClient);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

/**
 * Drop-in replacement for RTL's `render` — same return value, wrapped in the one
 * provider `root.tsx`'s `Layout` supplies in the real app. There is deliberately
 * no i18n provider: `vitest.setup.ts` initializes the i18next singleton and pins
 * it to `vi`, and `useTranslation()` falls back to that instance.
 */
export function render(ui: ReactElement) {
  return rtlRender(ui, { wrapper: Providers });
}
