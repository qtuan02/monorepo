import type {
  ChatFriendAcceptResponse,
  ChatFriendActionPayload,
  ChatFriendActionResponse,
  ChatFriendListParams,
  ChatFriendListResponse,
  ChatFriendRecord,
  ChatFriendRemoveResponse,
  ChatFriendRequestsPayload,
  ChatFriendRequestsResponse,
  ChatFriendRequestUser,
  ChatFriendSendRequestPayload,
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
      items: response.data.messages,
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

  async accept(
    payload: ChatFriendActionPayload,
  ): Promise<ChatFriendRequestUser> {
    const response = await this.client.post<ChatFriendAcceptResponse>(
      "/v1/friend/accept",
      payload,
    );

    return response.data;
  }

  async decline(payload: ChatFriendActionPayload): Promise<string | null> {
    const response = await this.client.post<ChatFriendActionResponse>(
      "/v1/friend/decline",
      payload,
    );

    return response.data;
  }

  async cancel(payload: ChatFriendActionPayload): Promise<string | null> {
    const response = await this.client.post<ChatFriendActionResponse>(
      "/v1/friend/cancel",
      payload,
    );

    return response.data;
  }

  async remove(friendId: string): Promise<string | null> {
    const response = await this.client.delete<ChatFriendRemoveResponse>(
      `/v1/friend/${friendId}`,
    );

    return response.data;
  }
}
