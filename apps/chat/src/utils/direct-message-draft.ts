import type { DirectMessageUser } from "~/types/direct-message-user";
import { isRecord } from "~/utils/is-record";

const DRAFT_CONVERSATION_ID_PREFIX = "draft-";

/** A Draft conversation (CONTEXT.md) has no backend id yet — this is a stand-in, scoped to one router state. */
export function createDraftConversationId(userId: string): string {
  return `${DRAFT_CONVERSATION_ID_PREFIX}${userId}`;
}

export function isDraftConversationId(conversationId: string): boolean {
  return conversationId.startsWith(DRAFT_CONVERSATION_ID_PREFIX);
}

function isDirectMessageUser(value: unknown): value is DirectMessageUser {
  if (!isRecord(value)) return false;

  const hasValidAvatarUrl =
    value.avatarUrl === undefined ||
    value.avatarUrl === null ||
    typeof value.avatarUrl === "string";

  return (
    typeof value.id === "string" &&
    typeof value.username === "string" &&
    typeof value.firstName === "string" &&
    typeof value.lastName === "string" &&
    hasValidAvatarUrl
  );
}

/**
 * `useOpenDirectConversation` (~/hooks/use-open-direct-conversation) writes this shape
 * into `navigate(..., { state })` — the whole channel a Draft conversation
 * travels over, so reading it back is the other half of that contract.
 */
export function getDraftUserFromLocationState(
  state: unknown,
): DirectMessageUser | null {
  if (!isRecord(state)) return null;

  const draftUser = state.directMessageDraftUser;
  return isDirectMessageUser(draftUser) ? draftUser : null;
}
