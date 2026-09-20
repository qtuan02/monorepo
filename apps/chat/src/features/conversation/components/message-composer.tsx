import { Send, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { ChatMessageRecord } from "@monorepo/types/chat-message";
import { Button } from "@monorepo/ui/components/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@monorepo/ui/components/input-group";
import { Spinner } from "@monorepo/ui/components/spinner";
import { cn } from "@monorepo/ui/utils/cn";

import type { Conversation } from "~/features/conversation/types/conversation";
import type { Message } from "~/features/conversation/types/message";
import MessageComposerEmojiPicker from "~/features/conversation/components/message-composer-emoji-picker";
import { useMessageComposer } from "~/features/conversation/hooks/use-message-composer";
import { PRIMARY_GRADIENT_CLASSNAME } from "~/features/conversation/utils/gradient-classnames";

interface MessageComposerProps {
  conversation: Conversation;
  /** T3 (spec #253) — the message being edited, or `null` outside edit mode. */
  editingMessage?: Message | null;
  onCancelEdit?: () => void;
  onSent?: (message: ChatMessageRecord) => void;
}

export default function MessageComposer({
  conversation,
  editingMessage = null,
  onCancelEdit = () => {},
  onSent,
}: MessageComposerProps) {
  const { t } = useTranslation();
  const {
    content,
    setContent,
    textareaRef,
    isPending,
    handleKeyDown,
    handleSubmit,
    insertEmoji,
  } = useMessageComposer(conversation, editingMessage, onCancelEdit, onSent);

  return (
    <div className="px-3 pt-2 pb-3 md:px-4">
      {editingMessage && (
        <div className="bg-muted/60 mb-1.5 flex items-center justify-between rounded-lg px-3 py-1.5">
          <span className="text-muted-foreground text-xs font-medium">
            {t("chat.convPane.composer.editingBanner")}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={onCancelEdit}
          >
            <X className="size-3.5" />
            {t("chat.convPane.composer.cancelEdit")}
          </Button>
        </div>
      )}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        <InputGroup className="bg-background items-end rounded-3xl border-transparent shadow-sm focus-within:shadow-md">
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
            className="max-h-32 min-h-10 py-2.5 pl-4"
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
              disabled={isPending || !content.trim()}
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
