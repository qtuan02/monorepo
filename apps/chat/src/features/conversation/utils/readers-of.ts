import type { ConversationMember } from "~/features/conversation/types/conversation";
import type { Message } from "~/features/conversation/types/message";

/**
 * Who has read UP TO this message and no further — the group avatar stack's
 * placement (brief §10 row 8): a reader's small avatar sits under the last
 * loaded message at or before their `lastReadAt`, and floats to a later
 * message once they read on. Time, not `lastReadMessageId` alone, because
 * the id may name a message outside the loaded pages (or one the reader sent
 * themselves), which would make the stack vanish. Never the signed-in visitor.
 */
export function readersOf(
  message: Pick<Message, "id" | "createdAt">,
  nextMessage: Pick<Message, "createdAt"> | undefined,
  participants: ConversationMember[],
  currentUserId: string,
): ConversationMember[] {
  return participants.filter((participant) => {
    if (participant.userId === currentUserId) return false;
    if (!participant.lastReadAt) {
      return participant.lastReadMessageId === message.id;
    }
    return (
      participant.lastReadAt >= message.createdAt &&
      (!nextMessage || participant.lastReadAt < nextMessage.createdAt)
    );
  });
}

/**
 * Direct's "Seen": has the other participant read at or past this message?
 * Unlike `readersOf` above (exact placement for the group avatar stack), a
 * direct conversation's one other reader may have moved on to a later
 * message of their own — `lastReadAt` orders correctly against `createdAt`
 * without needing the full message list to find that later message's index.
 */
export function isSeenByOther(
  message: Pick<Message, "createdAt">,
  otherParticipant: Pick<ConversationMember, "lastReadAt"> | undefined,
): boolean {
  return (
    !!otherParticipant?.lastReadAt &&
    otherParticipant.lastReadAt >= message.createdAt
  );
}
