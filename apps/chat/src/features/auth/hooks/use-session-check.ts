import * as React from "react";

import { chatAuthService } from "~/libs/http-client";
import { useAuthStore } from "~/stores/use-auth-store";

// Module-scoped so ProtectedRoute and GuestRoute mounting at the same time
// (they never do, but a fast double-navigation could) share one in-flight
// call instead of each firing its own `/auth/refresh`.
let refreshOnBoot: Promise<string> | null = null;

function refreshSessionOnce(): Promise<string> {
  refreshOnBoot ??= chatAuthService.refresh().finally(() => {
    refreshOnBoot = null;
  });

  return refreshOnBoot;
}

/**
 * The async half of the guard: a store token is only half of Session
 * (CONTEXT.md) — the other half is the `HttpOnly` refresh cookie a reload
 * carries but the store does not. Both guards call this before they decide,
 * so a page reload with a still-good cookie never bounces to sign-in, and
 * `/sign-in` itself bounces away once the cookie proves a session exists.
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
