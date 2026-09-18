import type { ChatBaseResponse } from "./chat-base";
import type { ChatMessageRecord } from "./chat-message";

export enum ChatConversationType {
  DIRECT = "DIRECT",
  GROUP = "GROUP",
}

export enum ChatParticipantRole {
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
}

export interface ChatConversationParticipant {
  userId: string;
  username?: string | null;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  role: ChatParticipantRole;
  // What this participant has read, for the `conversation.seen` socket event
  // to patch in place — null until they have read anything.
  lastReadMessageId?: string | null;
  lastReadAt?: string | null;
}

export interface ChatConversationRecord {
  id: string;
  type: ChatConversationType;
  groupName: string | null;
  lastMessage: ChatMessageRecord | null;
  lastMessageAt: string | null;
  unreadCount: number;
  participants: ChatConversationParticipant[];
}

export interface ChatConversationListParams {
  limit: number;
  cursor?: string;
  type?: ChatConversationType;
}

export interface ChatConversationListPayload {
  // Not a copy-paste bug: `chat-socket` names this field `messages` on both
  // the conversation-list and message-list endpoints.
  messages: ChatConversationRecord[];
  nextCursor: string | null;
}

export type ChatConversationListResponse =
  ChatBaseResponse<ChatConversationListPayload>;
