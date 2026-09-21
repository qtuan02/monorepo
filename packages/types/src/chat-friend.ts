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

/** Named after the backend DTO — a wire shape rather than one of this
 * package's own `Chat*` domain records, same as `DirectMessageRequest`. */
export interface UserSummaryDto {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
}

/**
 * One request, one shape: `user` is the person on the other end — the
 * recipient on a sent request, the sender on a received one. Replaces the
 * old `ChatSentFriendRequest`/`ChatReceivedFriendRequest` pair.
 */
export interface ChatFriendRequest {
  id: string;
  user: UserSummaryDto;
  message: string | null;
  createdAt: string;
}

export interface ChatFriendRequestsPayload {
  sentRequests: ChatFriendRequest[];
  receivedRequests: ChatFriendRequest[];
}

export interface ChatFriendListParams {
  search?: string;
  limit: number;
  offset?: number;
}

export interface ChatFriendListPayload {
  items: ChatFriendRecord[];
  nextOffset: number | null;
}

export type ChatFriendListResponse = ChatBaseResponse<ChatFriendListPayload>;
export type ChatFriendRequestsResponse =
  ChatBaseResponse<ChatFriendRequestsPayload>;

export interface ChatFriendSendRequestPayload {
  toUserId: string;
  message?: string;
}

export type ChatFriendActionResponse = ChatBaseResponse<string | null>;
export type ChatFriendAcceptResponse = ChatBaseResponse<UserSummaryDto>;
export type ChatFriendRemoveResponse = ChatBaseResponse<string | null>;
