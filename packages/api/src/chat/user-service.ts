import type {
  ChatUserProfile,
  ChatUserProfileResponse,
} from "@monorepo/types/chat-user";

import type { HttpClient } from "../client";

export class ChatUserService {
  constructor(private client: HttpClient) {}

  async me(): Promise<ChatUserProfile> {
    const response =
      await this.client.get<ChatUserProfileResponse>("/v1/user/me");

    return response.data;
  }
}
