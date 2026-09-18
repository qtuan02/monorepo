import type { ChatMessageRecord } from "@monorepo/types/chat-message";

import type { Message } from "~/features/conversation/types/message";

export function mapMessageToUiModel(
  record: ChatMessageRecord,
  senderNameById: Map<string, string>,
): Message {
  return {
    id: record.id,
    conversationId: record.conversationId,
    senderId: record.senderId,
    senderName: senderNameById.get(record.senderId) ?? "Unknown user",
    content: record.content,
    createdAt: record.createdAt,
  };
}
