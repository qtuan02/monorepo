import { useEffect, useRef, useState } from "react";

import type { Message } from "~/features/conversation/types/message";

/**
 * "N new messages ↓" (brief §10 row 6): counts messages appended to the tail
 * of the list while the visitor isn't at the bottom, and clears the moment
 * they return to it. `messages` must stay oldest-to-newest (see
 * hooks/api/message.ts) so a live arrival is always the LAST entry — never
 * an older page loaded onto the front, which grows the array without
 * changing its last id.
 */
export function useNewMessageIndicator(messages: Message[], atBottom: boolean) {
  const [count, setCount] = useState(0);
  const lastMessageIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const lastMessage = messages.at(-1);
    const previousLastId = lastMessageIdRef.current;
    lastMessageIdRef.current = lastMessage?.id;

    // Skip the first render (no previous id yet) and a front-loaded older page.
    if (!lastMessage || previousLastId === undefined) return;
    if (lastMessage.id === previousLastId) return;
    if (!atBottom) setCount((current) => current + 1);
  }, [messages, atBottom]);

  useEffect(() => {
    if (atBottom) setCount(0);
  }, [atBottom]);

  return { count, reset: () => setCount(0) };
}
