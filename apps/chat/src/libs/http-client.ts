import { ChatAuthService } from "@monorepo/api/chat/auth-service";
import { ChatConversationService } from "@monorepo/api/chat/conversation-service";
import { ChatHealthService } from "@monorepo/api/chat/health-service";
import { ChatMessageService } from "@monorepo/api/chat/message-service";
import { ChatUserService } from "@monorepo/api/chat/user-service";
import { createHttpClient } from "@monorepo/api/client";

import { env } from "~/env";
import { queryClient } from "~/libs/query-client";
import { useAuthStore } from "~/stores/use-auth-store";

// The one place `/api` is appended — `PUBLIC_CHAT_API_BASE_URL` is the
// backend's origin only, so no service method repeats it.
const BASE_URL = `${env.PUBLIC_CHAT_API_BASE_URL}/api`;

function isAuthPath(url: string): boolean {
  return url.includes("/auth/");
}

function clearSession() {
  useAuthStore.getState().logout();
  queryClient.clear();
}

// `chatAuthService` is referenced below before its own declaration — safe
// because neither callback runs during this module's evaluation, only later
// on a real request failure, by which point every export here has settled.
export const httpClient = createHttpClient({
  baseURL: BASE_URL,
  timeout: 10_000,

  // `chat-socket`'s refresh cookie is `HttpOnly` and cross-origin — it only
  // rides along on a request that asks for it (ADR-0014).
  withCredentials: true,

  getAuthToken: () => useAuthStore.getState().token,

  // Fires on a 401/403 from a request that hasn't retried yet (ADR-0014). A
  // `/auth/*` request opts itself out: a failed sign-in must fail as a
  // sign-in failure, and a failed refresh must not recursively try to
  // refresh again.
  onAuthError: async (error) => {
    const url = error.response?.config.url ?? "";
    if (isAuthPath(url)) return null;

    try {
      const token = await chatAuthService.refresh();
      useAuthStore.getState().setToken(token);
      return token;
    } catch {
      // The cookie is gone or the backend rejected it — the visitor is
      // signed out either way, same as the source app's `libs/axios.ts`.
      clearSession();
      return null;
    }
  },

  // Covers the one case `onAuthError` does not: a retried request that
  // fails 401 again. Idempotent with the `catch` above.
  onUnauthorized: () => {
    clearSession();
  },
});

export const chatAuthService = new ChatAuthService(httpClient);
export const chatHealthService = new ChatHealthService(httpClient);
export const chatUserService = new ChatUserService(httpClient);
export const chatConversationService = new ChatConversationService(httpClient);
export const chatMessageService = new ChatMessageService(httpClient);
