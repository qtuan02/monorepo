import type { ChatBaseResponse } from "./chat-base";

export enum ChatMessageType {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
  FILE = "FILE",
  SYSTEM = "SYSTEM",
}

export interface ChatMessageRecord {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachmentUrl?: string | null;
  type: ChatMessageType;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessageListParams {
  limit: number;
  cursor?: string;
}

export interface ChatMessageListPayload {
  // `chat-socket` names this field `messages` on every list endpoint,
  // including this one — see chat-conversation.ts.
  messages: ChatMessageRecord[];
  nextCursor: string | null;
}

export type ChatMessageListResponse = ChatBaseResponse<ChatMessageListPayload>;

export interface ChatSendDirectMessageParams {
  recipientId: string;
  content: string;
  type: ChatMessageType.TEXT;
  attachmentUrl: null;
}

export interface ChatSendGroupMessageParams {
  conversationId: string;
  content: string;
  type: ChatMessageType.TEXT;
  attachmentUrl: null;
}

export type ChatMessageResponse = ChatBaseResponse<ChatMessageRecord>;
