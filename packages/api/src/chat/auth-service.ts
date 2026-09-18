import type {
  ChatSignInPayload,
  ChatSignInResponse,
  ChatSignOutResponse,
  ChatSignUpPayload,
  ChatSignUpResponse,
} from "@monorepo/types/chat-auth";

import type { HttpClient } from "../client";

/**
 * Talks to `chat-socket`'s `/v1/auth/*`, which wraps every response in
 * `ChatBaseResponse`. Unwrapped here, so a caller — including the
 * `onAuthError` callback that calls `refresh()` — reads a plain value.
 */
export class ChatAuthService {
  constructor(private client: HttpClient) {}

  async signIn(payload: ChatSignInPayload): Promise<string> {
    const response = await this.client.post<ChatSignInResponse>(
      "/v1/auth/sign-in",
      payload,
    );

    return response.data.accessToken;
  }

  async signUp(payload: ChatSignUpPayload): Promise<void> {
    await this.client.post<ChatSignUpResponse>("/v1/auth/sign-up", payload);
  }

  async signOut(): Promise<void> {
    await this.client.post<ChatSignOutResponse>("/v1/auth/sign-out");
  }

  /** Exchanges the `HttpOnly` refresh cookie for a new access token. */
  async refresh(): Promise<string> {
    const response =
      await this.client.post<ChatSignInResponse>("/v1/auth/refresh");

    return response.data.accessToken;
  }
}
