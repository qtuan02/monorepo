import { cn } from "@monorepo/ui/utils/cn";

import type { Message } from "~/features/conversation/types/message";
import { formatMessageTime } from "~/utils/date";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <div
      className={cn(
        "max-w-[75%] rounded-2xl px-3 py-2 text-sm",
        isOwn
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-foreground",
      )}
    >
      <p className="break-words whitespace-pre-wrap">{message.content}</p>
      <p
        className={cn(
          "mt-0.5 text-right text-[10px]",
          isOwn ? "text-primary-foreground/70" : "text-muted-foreground",
        )}
      >
        {formatMessageTime(message.createdAt)}
      </p>
    </div>
  );
}
