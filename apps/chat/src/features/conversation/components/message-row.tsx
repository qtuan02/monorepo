import { cn } from "@monorepo/ui/utils/cn";

import type { Message } from "~/features/conversation/types/message";
import MessageBubble from "~/features/conversation/components/message-bubble";
import { formatMessageDateLabel, isSameDay } from "~/utils/date";

interface MessageRowProps {
  message: Message;
  previousMessage?: Message;
  isOwn: boolean;
}

export default function MessageRow({
  message,
  previousMessage,
  isOwn,
}: MessageRowProps) {
  const showDateDivider =
    !previousMessage ||
    !isSameDay(previousMessage.createdAt, message.createdAt);
  const showSenderName =
    !isOwn &&
    (!previousMessage ||
      previousMessage.senderId !== message.senderId ||
      showDateDivider);

  return (
    <div className="flex flex-col gap-1 px-3 py-1">
      {showDateDivider && (
        <div className="text-muted-foreground my-2 text-center text-xs font-medium">
          {formatMessageDateLabel(message.createdAt)}
        </div>
      )}
      {showSenderName && (
        <span className="text-muted-foreground ml-1 text-xs">
          {message.senderName}
        </span>
      )}
      <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
        <MessageBubble message={message} isOwn={isOwn} />
      </div>
    </div>
  );
}
