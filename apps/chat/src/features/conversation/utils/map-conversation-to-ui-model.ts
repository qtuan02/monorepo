import type { TFunction } from "i18next";

import type { ChatConversationRecord } from "@monorepo/types/chat-conversation";
import type { ChatMessageRecord } from "@monorepo/types/chat-message";
import { ChatConversationType } from "@monorepo/types/chat-conversation";
import { ChatMessageType } from "@monorepo/types/chat-message";

import type {
  Conversation,
  ConversationMember,
} from "~/features/conversation/types/conversation";

/** A text-less IMAGE/FILE last message previews as an emoji + word (T2,
 * spec #253) — never the raw content, which is empty for those. */
function previewText(message: ChatMessageRecord, t: TFunction): string {
  if (message.content) return message.content;
  if (message.type === ChatMessageType.IMAGE) {
    return t("chat.attachment.previewImage");
  }
  if (message.type === ChatMessageType.FILE) {
    return t("chat.attachment.previewFile");
  }
  return message.content;
}

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
  t: TFunction,
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
      ? `${lastMessageSenderName}: ${previewText(lastMessage, t)}`
      : "No messages yet.",
    lastMessageAt: record.lastMessageAt,
    unreadCount: record.unreadCount,
    avatarUrl: isGroup ? undefined : otherMember?.avatarUrl,
    members,
    otherMemberId: isGroup ? undefined : otherMember?.userId,
    currentUserId,
  };
}
