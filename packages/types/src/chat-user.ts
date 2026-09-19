import type { ChatBaseResponse } from "./chat-base";
import type { FriendStatus } from "./chat-friend";

export interface ChatUserProfile {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  avatarUrl?: string | null;
  bio?: string;
  phone?: string | null;
}

export type ChatUserProfileResponse = ChatBaseResponse<ChatUserProfile>;

export interface ChatUpdateUserParams {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  bio?: string;
  phone?: string;
}

export interface ChatUserSearchRecord {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  joinedAt: string;
  statusFriend: FriendStatus;
  // Only present when `statusFriend` is SENT — the id `ChatFriendService.cancel`
  // needs, since a search result carries no friend-request record of its own.
  requestId?: string;
}

export interface ChatUserSearchParams {
  search?: string;
  limit: number;
  offset?: number;
}

export interface ChatUserSearchPayload {
  // Same `messages` naming as every other list endpoint — see chat-conversation.ts.
  messages: ChatUserSearchRecord[];
  nextOffset: number | null;
}

export type ChatUserSearchResponse = ChatBaseResponse<ChatUserSearchPayload>;

export interface ChatUserInfo {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  phone?: string | null;
  statusFriend: FriendStatus;
}

export type ChatUserInfoResponse = ChatBaseResponse<ChatUserInfo>;
