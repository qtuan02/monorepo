import type { ChatBaseResponse } from "./chat-base";

/**
 * One user's relationship to the viewer — SENT/RECEIVED read directionally
 * from the viewer's side (see apps/chat/CONTEXT.md, "Friend request").
 */
export enum FriendStatus {
  NONE = "NONE",
  SELF = "SELF",
  FRIEND = "FRIEND",
  SENT = "SENT",
  RECEIVED = "RECEIVED",
}

export interface ChatFriendRecord {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  joinedAt: string;
}

export interface ChatFriendRequestUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
}

export interface ChatSentFriendRequest {
  id: string;
  toUser: ChatFriendRequestUser;
  createdAt: string;
}

export interface ChatReceivedFriendRequest {
  id: string;
  fromUser: ChatFriendRequestUser;
  createdAt: string;
}

export interface ChatFriendRequestsPayload {
  sentRequests: ChatSentFriendRequest[];
  receivedRequests: ChatReceivedFriendRequest[];
}

export interface ChatFriendListParams {
  search?: string;
  limit: number;
  offset?: number;
}

export interface ChatFriendListPayload {
  // `chat-socket` names this field `messages` on every list endpoint — see
  // chat-conversation.ts.
  messages: ChatFriendRecord[];
  nextOffset: number | null;
}

export type ChatFriendListResponse = ChatBaseResponse<ChatFriendListPayload>;
export type ChatFriendRequestsResponse =
  ChatBaseResponse<ChatFriendRequestsPayload>;

export interface ChatFriendSendRequestPayload {
  toUserId: string;
  message?: string;
}

export interface ChatFriendActionPayload {
  requestId: string;
}

export type ChatFriendActionResponse = ChatBaseResponse<string | null>;
export type ChatFriendAcceptResponse = ChatBaseResponse<ChatFriendRequestUser>;
export type ChatFriendRemoveResponse = ChatBaseResponse<string | null>;
