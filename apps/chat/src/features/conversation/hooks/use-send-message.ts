import * as React from "react";

import type { SendableMessageType } from "@monorepo/types/chat-message";
import { ChatConversationType } from "@monorepo/types/chat-conversation";

import type { Conversation } from "~/features/conversation/types/conversation";
import {
  useSendDirectMessageMutation,
  useSendGroupMessageMutation,
} from "~/hooks/api/message";
import { useCurrentUserQuery } from "~/hooks/api/user";

export interface SendMessageInput {
  content: string;
  /** TEXT unless an Attachment (T2, spec #253) rode along. */
  type: SendableMessageType;
  attachmentUrl: string | null;
}

/**
 * A mutation's own `isPending` only flips true once React commits the
 * render after `mutate` is called, so a second submit made before that
 * commit (e.g. a double Enter) still slips past it. Q13 (spec #195): a
 * synchronous ref lock replaces the source app's `useThrottle` for that
 * gap — see .agents/rules/tanstack-consume-mutation.md.
 */
export function useSendMessage(conversation: Conversation) {
  const currentUserQuery = useCurrentUserQuery();
  const sendDirectMessage = useSendDirectMessageMutation();
  const sendGroupMessage = useSendGroupMessageMutation();
  const isSubmittingRef = React.useRef(false);

  const isPending = sendDirectMessage.isPending || sendGroupMessage.isPending;

  const sendMessage = React.useCallback(
    async ({ content, type, attachmentUrl }: SendMessageInput) => {
      const currentUserId = currentUserQuery.data?.id;
      if (!currentUserId || isSubmittingRef.current) return;

      isSubmittingRef.current = true;
      try {
        if (conversation.type === ChatConversationType.DIRECT) {
          const recipientId = conversation.members.find(
            (member) => member.userId !== currentUserId,
          )?.userId;
          if (!recipientId) {
            throw new Error("No recipient for this conversation.");
          }

          // Returned (not just awaited): a Draft conversation's composer
          // reads the response's real `conversationId` off it to navigate
          // there — see conversation-panel.tsx.
          return await sendDirectMessage.mutateAsync({
            recipientId,
            content,
            type,
            attachmentUrl,
          });
        }

        return await sendGroupMessage.mutateAsync({
          conversationId: conversation.id,
          content,
          type,
          attachmentUrl,
        });
      } finally {
        isSubmittingRef.current = false;
      }
    },
    [
      conversation,
      currentUserQuery.data?.id,
      sendDirectMessage,
      sendGroupMessage,
    ],
  );

  return { sendMessage, isPending };
}
