import type { ChatBaseResponse } from "@monorepo/types/chat-base";
import type {
  ChatConversationListParams,
  ChatConversationListResponse,
  ChatConversationRecord,
} from "@monorepo/types/chat-conversation";

import type { HttpClient } from "../client";

export interface ChatConversationPage {
  items: ChatConversationRecord[];
  nextCursor: string | null;
}

export class ChatConversationService {
  constructor(private client: HttpClient) {}

  async getConversations(
    params: ChatConversationListParams,
  ): Promise<ChatConversationPage> {
    const response = await this.client.get<ChatConversationListResponse>(
      "/v1/conversation",
      { params },
    );

    return {
      items: response.data.messages,
      nextCursor: response.data.nextCursor,
    };
  }

  async markAsSeen(conversationId: string): Promise<void> {
    await this.client.patch<ChatBaseResponse<null>>(
      `/v1/conversation/${conversationId}/seen`,
    );
  }
}
