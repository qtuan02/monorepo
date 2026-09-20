import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { matchPath, Outlet, useLocation, useNavigate } from "react-router";

import { ChatSocketEventType } from "@monorepo/types/chat-socket";
import { toast } from "@monorepo/ui/components/toast";

import { ROUTES } from "~/constants/routes";
import {
  applyConversationRemovedToCache,
  applyConversationSeenToCache,
  applyConversationUpdateToCache,
  useMarkConversationAsSeenMutation,
} from "~/hooks/api/conversation";
import {
  appendConversationMessageToCache,
  removeConversationMessageFromCache,
} from "~/hooks/api/message";
import { useCurrentUserQuery } from "~/hooks/api/user";
import {
  subscribeToConversationMessages,
  subscribeToConversationUpdates,
} from "~/libs/socket";
import { useSocketStore } from "~/stores/use-socket-store";

interface ChatSocketProviderProps {
  /** The conversation on screen right now, or "" when none is open. */
  activeConversationId: string;
  children: ReactNode;
}

function isFromOtherUser(senderId: string, currentUserId?: string) {
  return !!currentUserId && senderId !== currentUserId;
}

/**
 * Patches the TanStack Query cache from the live socket, so a message or a
 * `seen` from another tab appears with no reload and no invalidate-driven
 * refetch. Mounted once per authenticated subtree by `ChatSocketRouteBoundary`
 * below — never per conversation, since `/user/queue/conversations` covers
 * every conversation at once and only the per-message topic needs the active
 * conversation's id.
 */
export function ChatSocketProvider({
  activeConversationId,
  children,
}: ChatSocketProviderProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const client = useSocketStore((state) => state.client);
  const isConnected = useSocketStore((state) => state.isConnected);
  const currentUserQuery = useCurrentUserQuery();
  const currentUserId = currentUserQuery.data?.id;
  const { mutate: markConversationAsSeen } =
    useMarkConversationAsSeenMutation();

  // Read through a ref inside the handler so the user-wide subscription
  // below survives a conversation switch: re-subscribing on every change
  // opens a gap the broker does not buffer across, and an event landing in
  // it is simply lost.
  const screenRef = useRef({ activeConversationId, currentUserId });
  useEffect(() => {
    screenRef.current = { activeConversationId, currentUserId };
  }, [activeConversationId, currentUserId]);

  useEffect(() => {
    if (!client || !isConnected) return;

    return subscribeToConversationUpdates(client, (event) => {
      const screen = screenRef.current;

      if (event.eventType === ChatSocketEventType.CONVERSATION_SEEN) {
        applyConversationSeenToCache(queryClient, event, screen.currentUserId);
        return;
      }

      if (event.eventType === ChatSocketEventType.CONVERSATION_REMOVED) {
        applyConversationRemovedToCache(queryClient, event);

        // Kicked, left, or the group was deleted while I had it open — a
        // self-triggered leave already navigated home before this arrives,
        // so `activeConversationId` no longer matches and this is a no-op.
        if (event.conversationId === screen.activeConversationId) {
          navigate(ROUTES.HOME, { replace: true });
          toast.add({
            title: t("chat.convPane.toast.removedFromConversation"),
            type: "info",
          });
        }
        return;
      }

      const { conversation } = event;
      if (conversation.lastMessage) {
        appendConversationMessageToCache(queryClient, conversation.lastMessage);
      }

      applyConversationUpdateToCache(queryClient, event, {
        unreadCount:
          conversation.id === screen.activeConversationId &&
          isFromOtherUser(
            conversation.lastMessage?.senderId ?? "",
            screen.currentUserId,
          )
            ? 0
            : undefined,
      });
    });
  }, [client, isConnected, navigate, queryClient, t]);

  useEffect(() => {
    if (!client || !isConnected || !activeConversationId) return;

    return subscribeToConversationMessages(
      client,
      activeConversationId,
      (event) => {
        const { message } = event;

        if (event.eventType === ChatSocketEventType.MESSAGE_DELETED) {
          removeConversationMessageFromCache(queryClient, message);
          return;
        }

        appendConversationMessageToCache(queryClient, message);

        // A brand-new message from someone else in the conversation I'm
        // looking at — mark it seen right away instead of waiting on the
        // next fetch/focus. An edit (MESSAGE_UPDATED) doesn't re-trigger it.
        if (
          event.eventType === ChatSocketEventType.MESSAGE_CREATED &&
          isFromOtherUser(message.senderId, currentUserId)
        ) {
          markConversationAsSeen(message.conversationId);
        }
      },
    );
  }, [
    activeConversationId,
    client,
    currentUserId,
    isConnected,
    markConversationAsSeen,
    queryClient,
  ]);

  return <>{children}</>;
}

/**
 * The route element between `ProtectedRoute` and the guarded screens (see
 * ~/pages/main.tsx): reads the conversation id off the URL itself, through
 * `matchPath`, rather than have every route hand it down as a prop.
 */
export function ChatSocketRouteBoundary() {
  const location = useLocation();
  const match = matchPath(ROUTES.CONVERSATION_BY_ID, location.pathname);
  const activeConversationId = match?.params.conversationId ?? "";

  return (
    <ChatSocketProvider activeConversationId={activeConversationId}>
      <Outlet />
    </ChatSocketProvider>
  );
}
