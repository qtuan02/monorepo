import * as React from "react";

import { chatAuthService } from "~/libs/http-client";
import { useAuthStore } from "~/stores/use-auth-store";

// Module-scoped so ProtectedRoute and GuestRoute checking at the same time
// (they never do, but a fast double-navigation could) share one in-flight
// call instead of each firing its own `/auth/refresh`.
let pendingRefresh: Promise<string> | null = null;

function refreshSessionOnce(): Promise<string> {
  pendingRefresh ??= chatAuthService.refresh().finally(() => {
    pendingRefresh = null;
  });

  return pendingRefresh;
}

/**
 * The async half of the guard: a store token is only half of Session
 * (CONTEXT.md) — the other half is the `HttpOnly` refresh cookie a reload
 * carries but the store does not. Both guards call this before they decide,
 * so a page reload with a still-good cookie never bounces to sign-in, and
 * `/sign-in` itself bounces away once the cookie proves a session exists.
 *
 * Deliberately an effect, not a `useQuery` (the one exception to
 * .agents/rules/react-effects-sync-only.md here): a rejected refresh runs
 * `~/libs/http-client`'s `onUnauthorized`, which calls `queryClient.clear()`
 * — that would drop the in-flight refresh query itself and leave the guard
 * refetching forever instead of settling on "signed out".
 */
export function useSessionCheck() {
  const token = useAuthStore((state) => state.token);
  const setToken = useAuthStore((state) => state.setToken);
  const [isCheckingSession, setIsCheckingSession] = React.useState(!token);

  React.useEffect(() => {
    if (token) {
      setIsCheckingSession(false);
      return;
    }

    let ignore = false;
    setIsCheckingSession(true);

    async function checkSession() {
      try {
        const freshToken = await refreshSessionOnce();
        if (!ignore) setToken(freshToken);
      } catch {
        // No cookie, or the backend rejected it — stay signed out.
      }

      if (!ignore) setIsCheckingSession(false);
    }

    void checkSession();

    return () => {
      ignore = true;
    };
  }, [token, setToken]);

  return { token, isCheckingSession };
}
