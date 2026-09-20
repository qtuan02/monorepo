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
  /** The read receipt (T4, brief §10 row 8) — the id/time of their last read message. */
  lastReadMessageId?: string;
  lastReadAt?: string;
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

/**
 * The list's `?filter=` chip (T2, brief §10 rows 14–18). "groups" is its own
 * server query (`type: "GROUP"`); "unread" filters client-side over whatever
 * "all" already loaded — see `filter-conversations.ts`.
 */
export const CONVERSATION_LIST_FILTERS = ["all", "unread", "groups"] as const;

export type ConversationListFilter = (typeof CONVERSATION_LIST_FILTERS)[number];

export function isConversationListFilter(
  value: string | null | undefined,
): value is ConversationListFilter {
  return (CONVERSATION_LIST_FILTERS as readonly string[]).includes(value ?? "");
}
