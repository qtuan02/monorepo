import type { ChatParticipantRole } from "@monorepo/types/chat-conversation";

/** The UI's read of a `ChatConversationParticipant` — see map-conversation-to-ui-model.ts. */
export interface ConversationMember {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  role: ChatParticipantRole;
}

/** The UI's read of a `ChatConversationRecord` — see map-conversation-to-ui-model.ts. */
export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  lastMessageAt: string | null;
  unreadCount: number;
  avatarUrl?: string;
  members: ConversationMember[];
}
