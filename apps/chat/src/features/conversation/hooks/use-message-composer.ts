import * as React from "react";
import { useTranslation } from "react-i18next";

import type { ChatMessageRecord } from "@monorepo/types/chat-message";
import { ChatMessageType } from "@monorepo/types/chat-message";
import { toast } from "@monorepo/ui/components/toast";

import type { Conversation } from "~/features/conversation/types/conversation";
import type { Message } from "~/features/conversation/types/message";
import { useSendMessage } from "~/features/conversation/hooks/use-send-message";
import {
  useUpdateMessageMutation,
  useUploadAttachmentMutation,
} from "~/hooks/api/message";
import { MAX_ATTACHMENT_SIZE_BYTES } from "~/utils/attachment";

interface EmojiSelection {
  native?: string;
}

/** One tệp mỗi tin (T2, spec #253) — "uploading" carries only the name the
 * uploading card shows; "ready" is what `handleSubmit` reads `url`/`contentType` from. */
export type ComposerAttachment =
  | { status: "uploading"; fileName: string }
  | { status: "ready"; fileName: string; url: string; contentType: string };

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
  const { t } = useTranslation();
  const [content, setContent] = React.useState("");
  const [attachment, setAttachment] = React.useState<ComposerAttachment | null>(
    null,
  );
  // The draft the visitor was composing before they opened edit mode — swapped
  // back in on exit, so "Huỷ" never loses what they were mid-typing.
  const [draftBeforeEdit, setDraftBeforeEdit] = React.useState("");
  const [syncedEditId, setSyncedEditId] = React.useState<string | null>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  // The file this hook is currently uploading/holding — an in-flight upload
  // whose file no longer matches this ref (superseded by a later select, or
  // by Remove) is stale and must not resurrect its own attachment state.
  const currentFileRef = React.useRef<File | null>(null);
  const { sendMessage, isPending: isSendPending } =
    useSendMessage(conversation);
  const uploadAttachment = useUploadAttachmentMutation();
  const updateMessage = useUpdateMessageMutation();
  const isPending = isSendPending || updateMessage.isPending;

  const editingId = editingMessage?.id ?? null;
  // Adjusting state during render (not an effect — see
  // .agents/rules/react-effects-sync-only.md) whenever the edit target
  // itself changes: swap the textarea to the message's text, remembering
  // what was there so it comes back once edit mode ends. The snapshot is
  // taken only when ENTERING edit mode (`syncedEditId` — the previous
  // value — was null): switching straight from editing one message to
  // editing another must not overwrite the original draft with the first
  // message's half-finished edit.
  if (editingId !== syncedEditId) {
    const wasEditing = syncedEditId !== null;
    setSyncedEditId(editingId);
    if (editingMessage) {
      if (!wasEditing) setDraftBeforeEdit(content);
      setContent(editingMessage.content);
    } else {
      setContent(draftBeforeEdit);
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: `editingId` is not read here — it's the trigger that refocuses on mount AND on every entry/exit of edit mode, not a value the effect body needs.
  React.useEffect(() => {
    textareaRef.current?.focus();
  }, [editingId]);

  const isUploadingAttachment = attachment?.status === "uploading";
  // Edit mode (T3) only rewrites a TEXT message's content, so an attachment
  // sitting in the composer neither enables Send nor rides along with the PATCH.
  const hasBody = editingMessage
    ? content.trim() !== ""
    : content.trim() !== "" || attachment !== null;
  const isSendDisabled = isPending || isUploadingAttachment || !hasBody;

  const handleFileSelected = React.useCallback(
    (file: File) => {
      if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
        toast.add({ title: t("chat.attachment.tooLarge"), type: "error" });
        return;
      }

      currentFileRef.current = file;
      setAttachment({ status: "uploading", fileName: file.name });
      uploadAttachment.mutate(file, {
        onSuccess: (uploaded) => {
          if (currentFileRef.current !== file) return;
          setAttachment({
            status: "ready",
            fileName: file.name,
            url: uploaded.url,
            contentType: uploaded.contentType,
          });
        },
        // The global MutationCache.onError already toasted the failure —
        // just drop the stuck "uploading" card so Send isn't disabled forever.
        onError: () => {
          if (currentFileRef.current !== file) return;
          setAttachment(null);
        },
      });
    },
    [t, uploadAttachment],
  );

  const handleAttachClick = React.useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      // Reset so choosing the same file again still fires this handler.
      event.target.value = "";
      if (file) handleFileSelected(file);
    },
    [handleFileSelected],
  );

  const handleRemoveAttachment = React.useCallback(() => {
    currentFileRef.current = null;
    setAttachment(null);
  }, []);

  const handleSubmit = React.useCallback(async () => {
    const trimmed = content.trim();
    if (isSendDisabled) return;

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

    const attachmentUrl =
      attachment?.status === "ready" ? attachment.url : null;
    const type =
      attachment?.status === "ready"
        ? attachment.contentType.startsWith("image/")
          ? ChatMessageType.IMAGE
          : ChatMessageType.FILE
        : ChatMessageType.TEXT;

    const previousAttachment = attachment;
    setContent("");
    setAttachment(null);
    try {
      const message = await sendMessage({
        content: trimmed,
        type,
        attachmentUrl,
      });
      if (message) onSent?.(message);
    } catch {
      // No toast here — the global MutationCache.onError already surfaced
      // the failure once. Only the composer's own content needs restoring.
      setContent(trimmed);
      setAttachment(previousAttachment);
    }
  }, [
    attachment,
    content,
    editingMessage,
    isSendDisabled,
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
    isSendDisabled,
    handleKeyDown,
    handleSubmit,
    insertEmoji,
    attachment,
    fileInputRef,
    handleAttachClick,
    handleFileInputChange,
    handleRemoveAttachment,
  };
}
