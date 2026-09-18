import type { ChatBaseResponse } from "./chat-base";

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
