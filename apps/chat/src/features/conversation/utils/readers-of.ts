import type { ConversationMember } from "~/features/conversation/types/conversation";
import type { Message } from "~/features/conversation/types/message";

/**
 * Who has read exactly UP TO this message and no further — the group avatar
 * stack's placement (brief §10 row 8): a reader's small avatar sits under
 * the one message their `lastReadMessageId` names, and floats to a later
 * message once they read on. Never the signed-in visitor themselves.
 */
export function readersOf(
  message: Pick<Message, "id">,
  participants: ConversationMember[],
  currentUserId: string,
): ConversationMember[] {
  return participants.filter(
    (participant) =>
      participant.userId !== currentUserId &&
      participant.lastReadMessageId === message.id,
  );
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
