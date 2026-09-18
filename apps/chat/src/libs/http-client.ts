import { createHttpClient } from "@monorepo/api/client";

import { env } from "~/env";
import { queryClient } from "~/libs/query-client";
import { useAuthStore } from "~/stores/use-auth-store";

// `env` is validated at boot, so no fallback is needed here.
//
// No service singleton yet: `@monorepo/api` gets its `Chat<Domain>Service`
// classes in a later ticket, instantiated here against this same client —
// see architecture-features-modules.md, "no `~/services/` folder inside an
// app".
//
// `PUBLIC_CHAT_API_BASE_URL` is the backend's origin only — this is the one
// place `/api` is appended, so no service method repeats it.
export const httpClient = createHttpClient({
  baseURL: `${env.PUBLIC_CHAT_API_BASE_URL}/api`,
  timeout: 10_000,

  // Both callbacks reach the store through `getState()` at call time, never a
  // value captured now. That is what keeps ~/libs below ~/stores in the import
  // graph: this module asks for a token per request instead of holding one.
  getAuthToken: () => useAuthStore.getState().token,

  onUnauthorized: () => {
    // Dropping the token is what the guards watch — they redirect to sign-in on
    // the next render. Clearing the cache stops the previous session's data from
    // being served to whoever signs in next.
    useAuthStore.getState().logout();
    queryClient.clear();
  },
});
