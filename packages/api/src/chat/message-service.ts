import type { ChatBaseResponse } from "@monorepo/types/chat-base";
import type {
  ChatMessageListParams,
  ChatMessageListResponse,
  ChatMessageRecord,
  ChatMessageResponse,
  ChatUpdateMessageParams,
  DirectMessageRequest,
  GroupMessageRequest,
} from "@monorepo/types/chat-message";
import type {
  ChatUploadedFile,
  ChatUploadResponse,
} from "@monorepo/types/chat-upload";

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
      items: response.data.items,
      nextCursor: response.data.nextCursor,
    };
  }

  async sendDirect(params: DirectMessageRequest): Promise<ChatMessageRecord> {
    const response = await this.client.post<ChatMessageResponse>(
      "/v1/message/direct",
      params,
    );

    return response.data;
  }

  async sendGroup(params: GroupMessageRequest): Promise<ChatMessageRecord> {
    const response = await this.client.post<ChatMessageResponse>(
      "/v1/message/group",
      params,
    );

    return response.data;
  }

  async updateMessage(
    messageId: string,
    params: ChatUpdateMessageParams,
  ): Promise<ChatMessageRecord> {
    const response = await this.client.patch<ChatMessageResponse>(
      `/v1/message/${messageId}`,
      params,
    );

    return response.data;
  }

  async deleteMessage(messageId: string): Promise<void> {
    await this.client.delete<ChatBaseResponse<null>>(
      `/v1/message/${messageId}`,
    );
  }

  /** Uploads before a send — the caller then passes the returned `url` as
   * that message's `attachmentUrl`. */
  async upload(file: File): Promise<ChatUploadedFile> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await this.client.post<ChatUploadResponse>(
      "/v1/upload",
      formData,
    );

    return response.data;
  }
}
