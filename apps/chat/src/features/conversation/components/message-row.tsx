import type * as React from "react";
import { CheckCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

import { defaultLanguage } from "@monorepo/i18n/languages";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@monorepo/ui/components/avatar";
import { Bubble, BubbleContent } from "@monorepo/ui/components/bubble";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "@monorepo/ui/components/message";
import { cn } from "@monorepo/ui/utils/cn";

import type { ConversationMember } from "~/features/conversation/types/conversation";
import type { MessagePosition } from "~/features/conversation/utils/group-messages";
import { ConversationAvatar } from "~/components/avatar/conversation-avatar";
import { PRIMARY_GRADIENT_CLASSNAME } from "~/features/conversation/utils/gradient-classnames";
import { formatMessageDateLabel, formatMessageTime } from "~/utils/date";
import { getInitials } from "~/utils/display";

const MAX_VISIBLE_READERS = 3;

/** The day pill — inline between two days here, and floating over the list
 * while it scrolls (message-list.tsx), so both read as the same badge. */
export function DateBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-card text-muted-foreground ring-border/60 rounded-full px-3 py-1 text-xs font-medium shadow-sm ring-1">
      {children}
    </span>
  );
}

const OWN_BUBBLE_CLASSNAME = cn(
  PRIMARY_GRADIENT_CLASSNAME,
  "border-transparent text-primary-foreground shadow-md shadow-primary/20",
);

/**
 * Messenger-style run shaping: a bubble keeps its full radius on the side
 * facing the other party and flattens the corners that touch its neighbours
 * in the same run, so a run reads as one voice rather than a stack of pills.
 */
function bubbleShapeClassName(
  isOwn: boolean,
  isFirstInGroup: boolean,
  isLastInGroup: boolean,
): string {
  return cn(
    "rounded-2xl px-3.5 py-2",
    isOwn
      ? [!isFirstInGroup && "rounded-tr-md", !isLastInGroup && "rounded-br-md"]
      : [!isFirstInGroup && "rounded-tl-md", !isLastInGroup && "rounded-bl-md"],
  );
}

interface MessageRowProps {
  position: MessagePosition;
  senderAvatarUrl?: string;
  /** Group only (T4, brief §10 row 8) — who has read exactly up to this message. */
  readers?: ConversationMember[];
  /** Direct only — the other participant has read at or past this own message. */
  seenByOther?: boolean;
}

export default function MessageRow({
  position,
  senderAvatarUrl,
  readers = [],
  seenByOther = false,
}: MessageRowProps) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? defaultLanguage;
  const {
    message,
    isSystem,
    isOwn,
    isFirstInGroup,
    isLastInGroup,
    showDateDivider,
  } = position;
  const visibleReaders = readers.slice(0, MAX_VISIBLE_READERS);
  const hiddenReaderCount = readers.length - visibleReaders.length;

  return (
    <div
      className={cn(
        "flex flex-col gap-0.5 px-3 md:px-5",
        isFirstInGroup ? "pt-3" : "pt-0.5",
      )}
    >
      {showDateDivider && (
        <div className="my-2 flex justify-center">
          <DateBadge>
            {formatMessageDateLabel(message.createdAt, language)}
          </DateBadge>
        </div>
      )}

      {isSystem ? (
        <div className="flex justify-center py-1">
          <span className="bg-muted/70 text-muted-foreground rounded-full px-3 py-1 text-xs">
            {message.content}
          </span>
        </div>
      ) : (
        <Message align={isOwn ? "end" : "start"}>
          {!isOwn && (
            // The avatar sits on the run's LAST bubble (Messenger's shape) —
            // the row is reversed so the last message is the one with it.
            <MessageAvatar className={cn(!isLastInGroup && "invisible")}>
              <ConversationAvatar
                title={message.senderName}
                avatarUrl={senderAvatarUrl}
              />
            </MessageAvatar>
          )}
          <MessageContent className="gap-0.5">
            {!isOwn && isFirstInGroup && (
              <MessageHeader>{message.senderName}</MessageHeader>
            )}
            <Bubble
              align={isOwn ? "end" : "start"}
              variant={isOwn ? "default" : "muted"}
              className="max-w-[min(80%,36rem)] min-w-0"
            >
              <BubbleContent
                className={cn(
                  bubbleShapeClassName(isOwn, isFirstInGroup, isLastInGroup),
                  isOwn && OWN_BUBBLE_CLASSNAME,
                )}
              >
                {/* `wrap-anywhere`, not `break-words`: only the former counts
                    toward min-content, so a pasted token with no spaces (a
                    JWT, a curl line) wraps instead of widening the bubble. */}
                <p className="wrap-anywhere whitespace-pre-wrap">
                  {message.content}
                </p>
              </BubbleContent>
            </Bubble>
            {isLastInGroup && (
              <MessageFooter className="gap-1.5 px-2 text-[11px] font-normal">
                <span>{formatMessageTime(message.createdAt)}</span>
                {seenByOther && (
                  <CheckCheck
                    aria-label={t("chat.convPane.row.seen")}
                    role="img"
                    className="text-primary size-3.5"
                  />
                )}
              </MessageFooter>
            )}
            {visibleReaders.length > 0 && (
              <div
                className={cn("flex", isOwn ? "justify-end" : "justify-start")}
              >
                <AvatarGroup>
                  {visibleReaders.map((reader) => (
                    <Avatar key={reader.userId} size="sm">
                      {reader.avatarUrl && (
                        <AvatarImage src={reader.avatarUrl} alt="" />
                      )}
                      <AvatarFallback>
                        {getInitials(reader.displayName)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {hiddenReaderCount > 0 && (
                    <AvatarGroupCount className="size-6 text-[10px]">
                      +{hiddenReaderCount}
                    </AvatarGroupCount>
                  )}
                </AvatarGroup>
              </div>
            )}
          </MessageContent>
        </Message>
      )}
    </div>
  );
}
