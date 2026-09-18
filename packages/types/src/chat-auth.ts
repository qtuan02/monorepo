import type { ChatBaseResponse } from "./chat-base";

export interface ChatSignInPayload {
  username: string;
  password: string;
}

export interface ChatSignUpPayload {
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
}

export interface ChatAuthToken {
  accessToken: string;
}

export type ChatSignInResponse = ChatBaseResponse<ChatAuthToken>;
export type ChatSignUpResponse = ChatBaseResponse<null>;
export type ChatSignOutResponse = ChatBaseResponse<null>;
export type ChatRefreshResponse = ChatBaseResponse<ChatAuthToken>;
