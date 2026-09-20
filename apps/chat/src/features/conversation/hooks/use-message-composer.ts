import * as React from "react";
import { useTranslation } from "react-i18next";

import type { ChatMessageRecord } from "@monorepo/types/chat-message";
import { ChatMessageType } from "@monorepo/types/chat-message";
import { toast } from "@monorepo/ui/components/toast";

import type { Conversation } from "~/features/conversation/types/conversation";
import { useSendMessage } from "~/features/conversation/hooks/use-send-message";
import { useUploadAttachmentMutation } from "~/hooks/api/message";
import { sendTyping } from "~/libs/socket";
import { useSocketStore } from "~/stores/use-socket-store";
import { MAX_ATTACHMENT_SIZE_BYTES } from "~/utils/attachment";
import { isDraftConversationId } from "~/utils/direct-message-draft";

/** Never gọi `sendTyping` more than once every ~2s (T4, spec #253) — a plain
 * timestamp ref, not the shared `useThrottle` (dropped at #195). */
const TYPING_SEND_THROTTLE_MS = 2000;

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
 * conversation-panel.tsx), so this focus effect only ever runs once per
 * mount and needs no `conversation.id` dependency — the rewrite the ticket
 * asks for in place of the source's `useEffect(…, [conversation.id, …])`,
 * which Biome flagged as an unnecessary dependency.
 *
 * `onSent` is optional — only a Draft conversation's composer needs it, to
 * navigate off the response's real `conversationId` (see conversation-panel.tsx).
 */
export function useMessageComposer(
  conversation: Conversation,
  onSent?: (message: ChatMessageRecord) => void,
) {
  const { t } = useTranslation();
  const [content, setContent] = React.useState("");
  const [attachment, setAttachment] = React.useState<ComposerAttachment | null>(
    null,
  );
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  // The file this hook is currently uploading/holding — an in-flight upload
  // whose file no longer matches this ref (superseded by a later select, or
  // by Remove) is stale and must not resurrect its own attachment state.
  const currentFileRef = React.useRef<File | null>(null);
  const lastTypingSentAtRef = React.useRef(0);
  const { sendMessage, isPending } = useSendMessage(conversation);
  const uploadAttachment = useUploadAttachmentMutation();
  const client = useSocketStore((state) => state.client);

  React.useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const isUploadingAttachment = attachment?.status === "uploading";
  const isSendDisabled =
    isPending || isUploadingAttachment || (!content.trim() && !attachment);

  const handleContentChange = React.useCallback(
    (value: string) => {
      setContent(value);

      if (!client || !value.trim() || isDraftConversationId(conversation.id)) {
        return;
      }

      const now = Date.now();
      if (now - lastTypingSentAtRef.current < TYPING_SEND_THROTTLE_MS) return;

      lastTypingSentAtRef.current = now;
      sendTyping(client, conversation.id);
    },
    [client, conversation.id],
  );

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
  }, [attachment, content, isSendDisabled, onSent, sendMessage]);

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
    handleContentChange,
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
