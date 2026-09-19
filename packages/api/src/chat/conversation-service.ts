import type { ChatBaseResponse } from "@monorepo/types/chat-base";
import type {
  ChatConversationListParams,
  ChatConversationListResponse,
  ChatConversationRecord,
  ChatConversationResponse,
  ChatCreateGroupParams,
  ChatGroupMembersParams,
  ChatLeaveGroupResponse,
  ChatUpdateGroupParams,
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

  async createGroup(
    params: ChatCreateGroupParams,
  ): Promise<ChatConversationRecord> {
    const response = await this.client.post<ChatConversationResponse>(
      "/v1/conversation",
      params,
    );

    return response.data;
  }

  async updateGroup(
    conversationId: string,
    params: ChatUpdateGroupParams,
  ): Promise<ChatConversationRecord> {
    const response = await this.client.patch<ChatConversationResponse>(
      `/v1/conversation/${conversationId}/group`,
      params,
    );

    return response.data;
  }

  async addMembers(
    conversationId: string,
    params: ChatGroupMembersParams,
  ): Promise<ChatConversationRecord> {
    const response = await this.client.post<ChatConversationResponse>(
      `/v1/conversation/${conversationId}/members`,
      params,
    );

    return response.data;
  }

  async removeMember(
    conversationId: string,
    memberId: string,
  ): Promise<ChatConversationRecord> {
    const response = await this.client.delete<ChatConversationResponse>(
      `/v1/conversation/${conversationId}/members/${memberId}`,
    );

    return response.data;
  }

  async leave(conversationId: string): Promise<void> {
    await this.client.post<ChatLeaveGroupResponse>(
      `/v1/conversation/${conversationId}/leave`,
    );
  }
}
