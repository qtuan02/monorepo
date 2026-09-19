import type {
  ChatConversationType,
  ChatParticipantRole,
} from "@monorepo/types/chat-conversation";

/** The UI's read of a `ChatConversationParticipant` — see map-conversation-to-ui-model.ts. */
export interface ConversationMember {
  userId: string;
  displayName: string;
  username?: string;
  avatarUrl?: string;
  role: ChatParticipantRole;
}

/** The UI's read of a `ChatConversationRecord` — see map-conversation-to-ui-model.ts. */
export interface Conversation {
  id: string;
  type: ChatConversationType;
  title: string;
  lastMessage: string;
  lastMessageAt: string | null;
  unreadCount: number;
  avatarUrl?: string;
  members: ConversationMember[];
  /** The other DIRECT participant's id — Presence has no group reading yet. */
  otherMemberId?: string;
  /** The signed-in visitor's own id — the details panel's own/admin checks. */
  currentUserId: string;
}
