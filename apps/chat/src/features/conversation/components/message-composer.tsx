import { Send } from "lucide-react";

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
  const {
    content,
    setContent,
    textareaRef,
    isPending,
    handleKeyDown,
    handleSubmit,
    insertEmoji,
  } = useMessageComposer(conversation, onSent);

  return (
    <div className="border-border border-t p-3">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        <InputGroup className="items-end rounded-3xl">
          <InputGroupAddon align="inline-start" className="self-end pb-2">
            <MessageComposerEmojiPicker onSelect={insertEmoji} />
          </InputGroupAddon>
          <InputGroupTextarea
            ref={textareaRef}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            aria-label="Message composer"
            placeholder={`Message ${conversation.title}…`}
            className="max-h-32 min-h-9 py-2"
          />
          <InputGroupAddon align="inline-end" className="self-end pb-1.5">
            <InputGroupButton
              type="submit"
              variant="default"
              size="icon-sm"
              disabled={isPending || !content.trim()}
              aria-label={isPending ? "Sending..." : "Send"}
              className={cn(
                PRIMARY_GRADIENT_CLASSNAME,
                "text-primary-foreground shadow-md shadow-primary/25",
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
      <p className="text-muted-foreground mt-1.5 hidden text-[11px] md:block">
        <kbd>Enter</kbd> to send · <kbd>Shift+Enter</kbd> for a new line
      </p>
    </div>
  );
}
