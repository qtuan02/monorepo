import type { InfiniteData } from "@tanstack/react-query";
import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";

import type { ChatConversationPage } from "@monorepo/api/chat/conversation-service";
import { ChatConversationType } from "@monorepo/types/chat-conversation";

import type { DirectMessageUser } from "~/types/direct-message-user";
import { ROUTES } from "~/constants/routes";
import { conversationQueryKeys } from "~/hooks/api/conversation";

/**
 * The "message this person" jump: if a DIRECT conversation with them is
 * already in the cache, go straight there; otherwise land on Home with the
 * person in router state, which `useDirectMessageDraft` reads to open a
 * Draft conversation (see apps/chat/CONTEXT.md). Read at click time, not
 * fetched on mount — the friends screen is not the reason the conversation
 * list loads (see .agents/rules/patterns-fetch-on-mount.md), and a Draft to
 * someone with an existing conversation still lands on it: the first send
 * goes by `recipientId` and comes back with the real `conversationId`.
 * App-level because `friends` and `conversation` are sibling slices (see
 * .agents/rules/architecture-feature-boundaries.md), and outside
 * `~/hooks/api` because it navigates — that layer is TanStack Query only.
 */
export function useOpenDirectConversation() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useCallback(
    (user: DirectMessageUser) => {
      const cached = queryClient.getQueryData<
        InfiniteData<ChatConversationPage>
      >(conversationQueryKeys.list());
      const existing = cached?.pages
        .flatMap((page) => page.items)
        .find(
          (conversation) =>
            conversation.type === ChatConversationType.DIRECT &&
            conversation.participants.some(
              (participant) => participant.userId === user.id,
            ),
        );

      if (existing) {
        navigate(ROUTES.conversationByIdPath(existing.id));
        return;
      }

      navigate(ROUTES.HOME, { state: { directMessageDraftUser: user } });
    },
    [navigate, queryClient],
  );
}
