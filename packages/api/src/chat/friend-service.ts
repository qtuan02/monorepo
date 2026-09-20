import type { ChatBaseResponse } from "@monorepo/types/chat-base";
import type {
  ChatFriendAcceptResponse,
  ChatFriendActionResponse,
  ChatFriendListParams,
  ChatFriendListResponse,
  ChatFriendRecord,
  ChatFriendRemoveResponse,
  ChatFriendRequestsPayload,
  ChatFriendRequestsResponse,
  ChatFriendSendRequestPayload,
  UserSummaryDto,
} from "@monorepo/types/chat-friend";

import type { HttpClient } from "../client";

export interface ChatFriendPage {
  items: ChatFriendRecord[];
  nextOffset: number | null;
}

export class ChatFriendService {
  constructor(private client: HttpClient) {}

  async list(params: ChatFriendListParams): Promise<ChatFriendPage> {
    const response = await this.client.get<ChatFriendListResponse>(
      "/v1/friend",
      { params },
    );

    return {
      items: response.data.items,
      nextOffset: response.data.nextOffset,
    };
  }

  async requests(): Promise<ChatFriendRequestsPayload> {
    const response =
      await this.client.get<ChatFriendRequestsResponse>("/v1/friend/request");

    return response.data;
  }

  async send(payload: ChatFriendSendRequestPayload): Promise<string | null> {
    const response = await this.client.post<ChatFriendActionResponse>(
      "/v1/friend/request",
      payload,
    );

    return response.data;
  }

  async accept(requestId: string): Promise<UserSummaryDto> {
    const response = await this.client.post<ChatFriendAcceptResponse>(
      `/v1/friend/request/${requestId}/accept`,
    );

    return response.data;
  }

  async decline(requestId: string): Promise<void> {
    await this.client.post<ChatBaseResponse<null>>(
      `/v1/friend/request/${requestId}/decline`,
    );
  }

  async cancel(requestId: string): Promise<void> {
    await this.client.delete<ChatBaseResponse<null>>(
      `/v1/friend/request/${requestId}`,
    );
  }

  async remove(friendId: string): Promise<string | null> {
    const response = await this.client.delete<ChatFriendRemoveResponse>(
      `/v1/friend/${friendId}`,
    );

    return response.data;
  }
}
