import { Paperclip, Send } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { ChatMessageRecord } from "@monorepo/types/chat-message";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@monorepo/ui/components/input-group";
import { Spinner } from "@monorepo/ui/components/spinner";
import { cn } from "@monorepo/ui/utils/cn";

import type { Conversation } from "~/features/conversation/types/conversation";
import MessageComposerAttachment from "~/features/conversation/components/message-composer-attachment";
import MessageComposerEmojiPicker from "~/features/conversation/components/message-composer-emoji-picker";
import { useMessageComposer } from "~/features/conversation/hooks/use-message-composer";
import { PRIMARY_GRADIENT_CLASSNAME } from "~/features/conversation/utils/gradient-classnames";

interface MessageComposerProps {
  conversation: Conversation;
  onSent?: (message: ChatMessageRecord) => void;
}

export default function MessageComposer({
  conversation,
  onSent,
}: MessageComposerProps) {
  const { t } = useTranslation();
  const {
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
  } = useMessageComposer(conversation, onSent);

  return (
    <div className="px-3 pt-2 pb-3 md:px-4">
      {attachment && (
        <MessageComposerAttachment
          attachment={attachment}
          onRemove={handleRemoveAttachment}
        />
      )}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInputChange}
          aria-label={t("chat.attachment.attachButton")}
          className="sr-only"
          tabIndex={-1}
        />
        <InputGroup className="bg-background items-end rounded-3xl border-transparent shadow-sm focus-within:shadow-md">
          <InputGroupAddon align="inline-start" className="self-end pb-1 pl-1">
            <InputGroupButton
              type="button"
              size="icon-sm"
              onClick={handleAttachClick}
              aria-label={t("chat.attachment.attachButton")}
            >
              <Paperclip className="size-4" />
            </InputGroupButton>
          </InputGroupAddon>
          <InputGroupTextarea
            ref={textareaRef}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            aria-label={t("chat.convPane.composer.ariaLabel")}
            placeholder={t("chat.convPane.composer.placeholder", {
              title: conversation.title,
            })}
            className="max-h-32 min-h-10 py-2.5 pl-1"
          />
          {/* Emoji and Send share one addon so they sit on the same line,
              centred on a one-line message and pinned to the bottom of a
              taller one — never one high and one low. */}
          <InputGroupAddon
            align="inline-end"
            className="gap-1 self-end pb-1 pr-2"
          >
            <MessageComposerEmojiPicker onSelect={insertEmoji} />
            <InputGroupButton
              type="submit"
              variant="default"
              size="icon-sm"
              disabled={isSendDisabled}
              aria-label={
                isPending
                  ? t("chat.convPane.composer.sending")
                  : t("chat.convPane.composer.send")
              }
              className={cn(
                PRIMARY_GRADIENT_CLASSNAME,
                "text-primary-foreground shadow-primary/25 rounded-full shadow-md transition-opacity disabled:opacity-40",
              )}
            >
              {isPending ? (
                <Spinner className="size-4" />
              ) : (
                <Send className="size-4" />
              )}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </form>
      <p className="text-muted-foreground mt-1.5 hidden px-2 text-[11px] md:block">
        <kbd>Enter</kbd> {t("chat.convPane.composer.toSend")} ·{" "}
        <kbd>Shift+Enter</kbd> {t("chat.convPane.composer.newLine")}
      </p>
    </div>
  );
}
