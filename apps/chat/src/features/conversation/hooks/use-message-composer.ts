import * as React from "react";

import type { Conversation } from "~/features/conversation/types/conversation";
import { useSendMessage } from "~/features/conversation/hooks/use-send-message";

interface EmojiSelection {
  native?: string;
}

/**
 * `MessageComposer` remounts under `key={conversation.id}` (see
 * conversation-panel.tsx), so this focus effect only ever runs once per
 * mount and needs no `conversation.id` dependency — the rewrite the ticket
 * asks for in place of the source's `useEffect(…, [conversation.id, …])`,
 * which Biome flagged as an unnecessary dependency.
 */
export function useMessageComposer(conversation: Conversation) {
  const [content, setContent] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const { sendMessage, isPending } = useSendMessage(conversation);

  React.useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = React.useCallback(async () => {
    const trimmed = content.trim();
    if (!trimmed || isPending) return;

    setContent("");
    try {
      await sendMessage(trimmed);
    } catch {
      // No toast here — the global MutationCache.onError already surfaced
      // the failure once. Only the composer's own content needs restoring.
      setContent(trimmed);
    }
  }, [content, isPending, sendMessage]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key !== "Enter" || event.shiftKey) return;

      event.preventDefault();
      void handleSubmit();
    },
    [handleSubmit],
  );

  const insertEmoji = React.useCallback((emoji: EmojiSelection) => {
    const native = emoji.native;
    const textarea = textareaRef.current;
    if (!native || !textarea) return;

    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? start;

    setContent(
      (previous) =>
        `${previous.slice(0, start)}${native}${previous.slice(end)}`,
    );

    const cursorPosition = start + native.length;
    window.requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPosition, cursorPosition);
    });
  }, []);

  return {
    content,
    setContent,
    textareaRef,
    isPending,
    handleKeyDown,
    handleSubmit,
    insertEmoji,
  };
}
