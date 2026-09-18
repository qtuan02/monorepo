import { Send } from "lucide-react";

import type { ChatMessageRecord } from "@monorepo/types/chat-message";
import { Button } from "@monorepo/ui/components/button";
import { Textarea } from "@monorepo/ui/components/textarea";

import type { Conversation } from "~/features/conversation/types/conversation";
import MessageComposerEmojiPicker from "~/features/conversation/components/message-composer-emoji-picker";
import { useMessageComposer } from "~/features/conversation/hooks/use-message-composer";

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
    <form
      className="border-border flex items-end gap-2 border-t p-3"
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit();
      }}
    >
      <MessageComposerEmojiPicker onSelect={insertEmoji} />
      <Textarea
        ref={textareaRef}
        value={content}
        onChange={(event) => setContent(event.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        aria-label="Message composer"
        placeholder="Aa"
        className="max-h-32 min-h-10 flex-1 resize-none rounded-3xl"
      />
      <Button
        type="submit"
        size="icon"
        disabled={isPending || !content.trim()}
        aria-label={isPending ? "Sending..." : "Send"}
      >
        <Send className="size-4" />
      </Button>
    </form>
  );
}
