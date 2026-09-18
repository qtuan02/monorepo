import type {
  ChatUserInfo,
  ChatUserInfoResponse,
  ChatUserProfile,
  ChatUserProfileResponse,
  ChatUserSearchParams,
  ChatUserSearchRecord,
  ChatUserSearchResponse,
} from "@monorepo/types/chat-user";

import type { HttpClient } from "../client";

export interface ChatUserSearchPage {
  items: ChatUserSearchRecord[];
  nextOffset: number | null;
}

export class ChatUserService {
  constructor(private client: HttpClient) {}

  async me(): Promise<ChatUserProfile> {
    const response =
      await this.client.get<ChatUserProfileResponse>("/v1/user/me");

    return response.data;
  }

  async search(params: ChatUserSearchParams): Promise<ChatUserSearchPage> {
    const response = await this.client.get<ChatUserSearchResponse>("/v1/user", {
      params,
    });

    return {
      items: response.data.messages,
      nextOffset: response.data.nextOffset,
    };
  }

  async info(userId: string): Promise<ChatUserInfo> {
    const response = await this.client.get<ChatUserInfoResponse>(
      "/v1/user/info",
      { params: { userId } },
    );

    return response.data;
  }
}
