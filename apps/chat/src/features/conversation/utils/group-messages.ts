import { ChatMessageType } from "@monorepo/types/chat-message";

import type { Message } from "~/features/conversation/types/message";
import { isSameDay, minutesBetween } from "~/utils/date";

const GROUP_GAP_MINUTES = 5;

export interface MessagePosition {
  message: Message;
  isSystem: boolean;
  isOwn: boolean;
  /** Whether this is the first message of a same-sender run — where the avatar/name renders. */
  isFirstInGroup: boolean;
  /** Whether this is the last message of a same-sender run — where the time renders. */
  isLastInGroup: boolean;
  /** Whether a date-divider pill precedes this message. */
  showDateDivider: boolean;
}

function joins(a: Message, b: Message): boolean {
  return (
    a.type !== ChatMessageType.SYSTEM &&
    b.type !== ChatMessageType.SYSTEM &&
    a.senderId === b.senderId &&
    isSameDay(a.createdAt, b.createdAt) &&
    minutesBetween(a.createdAt, b.createdAt) < GROUP_GAP_MINUTES
  );
}

/**
 * One position per input message, in the same order — a pure re-read of
 * consecutive same-sender runs (< 5 minutes apart, never crossing a day),
 * the boundary the pane renders avatar/name/time against. A SYSTEM message
 * always starts and ends its own run of one, so it never merges with a
 * neighboring bubble.
 */
export function groupMessages(
  messages: Message[],
  currentUserId: string,
): MessagePosition[] {
  return messages.map((message, index) => {
    const previous = messages[index - 1];
    const next = messages[index + 1];
    const isSystem = message.type === ChatMessageType.SYSTEM;

    return {
      message,
      isSystem,
      isOwn: message.senderId === currentUserId,
      isFirstInGroup: !previous || isSystem || !joins(previous, message),
      isLastInGroup: !next || isSystem || !joins(message, next),
      showDateDivider:
        !previous || !isSameDay(previous.createdAt, message.createdAt),
    };
  });
}
