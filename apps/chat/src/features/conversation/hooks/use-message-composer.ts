import * as React from "react";

import type { ChatMessageRecord } from "@monorepo/types/chat-message";

import type { Conversation } from "~/features/conversation/types/conversation";
import type { Message } from "~/features/conversation/types/message";
import { useSendMessage } from "~/features/conversation/hooks/use-send-message";
import { useUpdateMessageMutation } from "~/hooks/api/message";

interface EmojiSelection {
  native?: string;
}

/**
 * `MessageComposer` remounts under `key={conversation.id}` (see
 * conversation-panel.tsx), so the mount-focus branch below only ever runs
 * once per conversation and needs no `conversation.id` dependency — the
 * rewrite the ticket asks for in place of the source's
 * `useEffect(…, [conversation.id, …])`, which Biome flagged as an
 * unnecessary dependency.
 *
 * `onSent` is optional — only a Draft conversation's composer needs it, to
 * navigate off the response's real `conversationId` (see conversation-panel.tsx).
 *
 * `editingMessage` (T3, spec #253) is `null` outside edit mode, or the
 * message the "Sửa" menu item picked — see message-row.tsx. `onExitEdit`
 * fires both on a successful `PATCH` and on Esc/"Huỷ", so the caller has one
 * place to clear its own `editingMessage` state (conversation-panel.tsx).
 */
export function useMessageComposer(
  conversation: Conversation,
  editingMessage: Message | null,
  onExitEdit: () => void,
  onSent?: (message: ChatMessageRecord) => void,
) {
  const [content, setContent] = React.useState("");
  // The draft the visitor was composing before they opened edit mode — swapped
  // back in on exit, so "Huỷ" never loses what they were mid-typing.
  const [draftBeforeEdit, setDraftBeforeEdit] = React.useState("");
  const [syncedEditId, setSyncedEditId] = React.useState<string | null>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const { sendMessage, isPending: isSendPending } =
    useSendMessage(conversation);
  const updateMessage = useUpdateMessageMutation();
  const isPending = isSendPending || updateMessage.isPending;

  const editingId = editingMessage?.id ?? null;
  // Adjusting state during render (not an effect — see
  // .agents/rules/react-effects-sync-only.md) whenever the edit target
  // itself changes: swap the textarea to the message's text, remembering
  // what was there so it comes back once edit mode ends.
  if (editingId !== syncedEditId) {
    setSyncedEditId(editingId);
    if (editingMessage) {
      setDraftBeforeEdit(content);
      setContent(editingMessage.content);
    } else {
      setContent(draftBeforeEdit);
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: `editingId` is not read here — it's the trigger that refocuses on mount AND on every entry/exit of edit mode, not a value the effect body needs.
  React.useEffect(() => {
    textareaRef.current?.focus();
  }, [editingId]);

  const handleSubmit = React.useCallback(async () => {
    const trimmed = content.trim();
    if (!trimmed || isPending) return;

    if (editingMessage) {
      try {
        await updateMessage.mutateAsync({
          messageId: editingMessage.id,
          params: { content: trimmed },
        });
        onExitEdit();
      } catch {
        // Kept in the textarea — the global MutationCache.onError already
        // surfaced the failure once, and the visitor can just retry Enter.
      }
      return;
    }

    setContent("");
    try {
      const message = await sendMessage(trimmed);
      if (message) onSent?.(message);
    } catch {
      // No toast here — the global MutationCache.onError already surfaced
      // the failure once. Only the composer's own content needs restoring.
      setContent(trimmed);
    }
  }, [
    content,
    editingMessage,
    isPending,
    onExitEdit,
    onSent,
    sendMessage,
    updateMessage,
  ]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Escape" && editingMessage) {
        event.preventDefault();
        onExitEdit();
        return;
      }
      if (event.key !== "Enter" || event.shiftKey) return;

      event.preventDefault();
      void handleSubmit();
    },
    [editingMessage, handleSubmit, onExitEdit],
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
