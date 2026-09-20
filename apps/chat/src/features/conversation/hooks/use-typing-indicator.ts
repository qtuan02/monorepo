import * as React from "react";

import type { ChatTypingEvent } from "@monorepo/types/chat-socket";

import { subscribeToTyping } from "~/libs/socket";
import { useSocketStore } from "~/stores/use-socket-store";
import { isDraftConversationId } from "~/utils/direct-message-draft";

/** How long a typing signal stays "live" with no follow-up event (T4, spec #253). */
const TYPING_EXPIRY_MS = 3000;

/**
 * `/topic/conversations/{id}/typing` — subscribed for exactly as long as
 * this conversation is open (a Draft conversation has no backend id to
 * subscribe with). `Map<userId, timeout>` lives in a ref: each event resets
 * that user's own 3s window, a matching `setTimeout` is the "timer dọn",
 * and the visitor's own id never enters the map. Pane-only state — never
 * cache data, never rendered in the conversation list (CONTEXT.md, "Typing").
 */
export function useTypingIndicator(
  conversationId: string | undefined,
  currentUserId: string | undefined,
): string[] {
  const client = useSocketStore((state) => state.client);
  const isConnected = useSocketStore((state) => state.isConnected);
  const [typingUserIds, setTypingUserIds] = React.useState<string[]>([]);

  React.useEffect(() => {
    const timersByUserId = new Map<string, ReturnType<typeof setTimeout>>();
    setTypingUserIds([]);

    if (
      !client ||
      !isConnected ||
      !conversationId ||
      isDraftConversationId(conversationId)
    ) {
      return;
    }

    const handleTyping = (event: ChatTypingEvent) => {
      if (event.userId === currentUserId) return;

      const existingTimer = timersByUserId.get(event.userId);
      if (existingTimer) clearTimeout(existingTimer);

      timersByUserId.set(
        event.userId,
        setTimeout(() => {
          timersByUserId.delete(event.userId);
          setTypingUserIds((previous) =>
            previous.filter((userId) => userId !== event.userId),
          );
        }, TYPING_EXPIRY_MS),
      );

      setTypingUserIds((previous) =>
        previous.includes(event.userId)
          ? previous
          : [...previous, event.userId],
      );
    };

    const unsubscribe = subscribeToTyping(client, conversationId, handleTyping);

    return () => {
      unsubscribe();
      for (const timer of timersByUserId.values()) clearTimeout(timer);
    };
  }, [client, isConnected, conversationId, currentUserId]);

  return typingUserIds;
}
