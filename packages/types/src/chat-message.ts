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
  items: ChatMessageRecord[];
  nextCursor: string | null;
}

export type ChatMessageListResponse = ChatBaseResponse<ChatMessageListPayload>;

export type SendableMessageType =
  | ChatMessageType.TEXT
  | ChatMessageType.IMAGE
  | ChatMessageType.FILE;

/** Named after the backend DTO, same as `GroupMessageRequest` and
 * `UserSummaryDto` — a wire request shape, not a `Chat*` domain record. */
export interface DirectMessageRequest {
  recipientId: string;
  content: string;
  type: SendableMessageType;
  attachmentUrl: string | null;
}

export interface GroupMessageRequest {
  conversationId: string;
  content: string;
  type: SendableMessageType;
  attachmentUrl: string | null;
}

export type ChatMessageResponse = ChatBaseResponse<ChatMessageRecord>;

export interface ChatUpdateMessageParams {
  content: string;
}
