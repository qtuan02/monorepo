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
  const members: ConversationMember[] = record.participants.map(
    (participant) => ({
      userId: participant.userId,
      displayName: toDisplayName(participant),
      avatarUrl: participant.avatarUrl ?? undefined,
      role: participant.role,
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
  };
}
