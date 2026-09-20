import type { ChatConversationRecord } from "@monorepo/types/chat-conversation";
import { ChatConversationType } from "@monorepo/types/chat-conversation";

import type {
  Conversation,
  ConversationMember,
} from "~/features/conversation/types/conversation";

function toDisplayName(participant: {
  firstName: string;
  lastName: string;
  username?: string | null;
}): string {
  return (
    [participant.firstName, participant.lastName].filter(Boolean).join(" ") ||
    participant.username ||
    "Unknown user"
  );
}

export function mapConversationToUiModel(
  record: ChatConversationRecord,
  currentUserId: string,
): Conversation {
  // A malformed record from the backend can omit `participants` outright even
  // though the type says otherwise — treat it as empty rather than throwing
  // out of `.map` (spec #251/#252).
  // biome-ignore lint/suspicious/noUnnecessaryConditions: defends against a real backend record violating the type, not a type-level impossibility.
  const members: ConversationMember[] = (record.participants ?? []).map(
    (participant) => ({
      userId: participant.userId,
      displayName: toDisplayName(participant),
      username: participant.username ?? undefined,
      avatarUrl: participant.avatarUrl ?? undefined,
      role: participant.role,
      lastReadMessageId: participant.lastReadMessageId ?? undefined,
      lastReadAt: participant.lastReadAt ?? undefined,
    }),
  );

  const isGroup = record.type === ChatConversationType.GROUP;
  const otherMember = members.find((member) => member.userId !== currentUserId);

  const lastMessage = record.lastMessage;
  const lastMessageSenderName = lastMessage
    ? lastMessage.senderId === currentUserId
      ? "You"
      : (members.find((member) => member.userId === lastMessage.senderId)
          ?.displayName ?? "Unknown user")
    : undefined;

  return {
    id: record.id,
    type: record.type,
    title: isGroup
      ? record.groupName || "Group conversation"
      : otherMember?.displayName || "Direct message",
    lastMessage: lastMessage
      ? `${lastMessageSenderName}: ${lastMessage.content}`
      : "No messages yet.",
    lastMessageAt: record.lastMessageAt,
    unreadCount: record.unreadCount,
    avatarUrl: isGroup ? undefined : otherMember?.avatarUrl,
    members,
    otherMemberId: isGroup ? undefined : otherMember?.userId,
    currentUserId,
  };
}
