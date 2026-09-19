import { Bubble, BubbleContent } from "@monorepo/ui/components/bubble";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "@monorepo/ui/components/message";
import { cn } from "@monorepo/ui/utils/cn";

import type { MessagePosition } from "~/features/conversation/utils/group-messages";
import { ConversationAvatar } from "~/components/avatar/conversation-avatar";
import { PRIMARY_GRADIENT_CLASSNAME } from "~/features/conversation/utils/gradient-classnames";
import { formatMessageDateLabel, formatMessageTime } from "~/utils/date";

const OWN_BUBBLE_CLASSNAME = cn(
  PRIMARY_GRADIENT_CLASSNAME,
  "border-transparent text-primary-foreground shadow-lg shadow-primary/25",
);

interface MessageRowProps {
  position: MessagePosition;
  senderAvatarUrl?: string;
}

export default function MessageRow({
  position,
  senderAvatarUrl,
}: MessageRowProps) {
  const {
    message,
    isSystem,
    isOwn,
    isFirstInGroup,
    isLastInGroup,
    showDateDivider,
  } = position;

  return (
    <div
      className={cn(
        "flex flex-col gap-0.5 px-3",
        isFirstInGroup ? "pt-3" : "pt-0.5",
      )}
    >
      {showDateDivider && (
        <div className="my-2 flex justify-center">
          <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs font-medium">
            {formatMessageDateLabel(message.createdAt)}
          </span>
        </div>
      )}

      {isSystem ? (
        <div className="flex justify-center py-1">
          <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs">
            {message.content}
          </span>
        </div>
      ) : (
        <Message align={isOwn ? "end" : "start"}>
          {!isOwn && (
            <MessageAvatar className={cn(!isFirstInGroup && "invisible")}>
              <ConversationAvatar
                title={message.senderName}
                avatarUrl={senderAvatarUrl}
              />
            </MessageAvatar>
          )}
          <MessageContent>
            {!isOwn && isFirstInGroup && (
              <MessageHeader>{message.senderName}</MessageHeader>
            )}
            <Bubble
              align={isOwn ? "end" : "start"}
              variant={isOwn ? "default" : "muted"}
            >
              <BubbleContent
                className={isOwn ? OWN_BUBBLE_CLASSNAME : undefined}
              >
                <p className="break-words whitespace-pre-wrap">
                  {message.content}
                </p>
              </BubbleContent>
            </Bubble>
            {isLastInGroup && (
              <MessageFooter>
                {formatMessageTime(message.createdAt)}
              </MessageFooter>
            )}
          </MessageContent>
        </Message>
      )}
    </div>
  );
}
