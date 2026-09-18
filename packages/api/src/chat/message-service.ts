import type {
  ChatMessageListParams,
  ChatMessageListResponse,
  ChatMessageRecord,
  ChatMessageResponse,
  ChatSendDirectMessageParams,
  ChatSendGroupMessageParams,
} from "@monorepo/types/chat-message";

import type { HttpClient } from "../client";

export interface ChatMessagePage {
  items: ChatMessageRecord[];
  nextCursor: string | null;
}

export class ChatMessageService {
  constructor(private client: HttpClient) {}

  async getMessages(
    conversationId: string,
    params: ChatMessageListParams,
  ): Promise<ChatMessagePage> {
    const response = await this.client.get<ChatMessageListResponse>(
      `/v1/conversation/${conversationId}/messages`,
      { params },
    );

    return {
      items: response.data.messages,
      nextCursor: response.data.nextCursor,
    };
  }

  async sendDirect(
    params: ChatSendDirectMessageParams,
  ): Promise<ChatMessageRecord> {
    const response = await this.client.post<ChatMessageResponse>(
      "/v1/message/direct",
      params,
    );

    return response.data;
  }

  async sendGroup(
    params: ChatSendGroupMessageParams,
  ): Promise<ChatMessageRecord> {
    const response = await this.client.post<ChatMessageResponse>(
      "/v1/message/group",
      params,
    );

    return response.data;
  }
}
