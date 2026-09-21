import type * as React from "react";
import { useState } from "react";
import { CheckCheck, File as FileIcon, MoreHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";

import { defaultLanguage } from "@monorepo/i18n/languages";
import { ChatMessageType } from "@monorepo/types/chat-message";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@monorepo/ui/components/alert-dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@monorepo/ui/components/avatar";
import { Bubble, BubbleContent } from "@monorepo/ui/components/bubble";
import { Button } from "@monorepo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@monorepo/ui/components/dropdown-menu";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "@monorepo/ui/components/message";
import { cn } from "@monorepo/ui/utils/cn";

import type { ConversationMember } from "~/features/conversation/types/conversation";
import type { Message as ChatMessage } from "~/features/conversation/types/message";
import type { MessagePosition } from "~/features/conversation/utils/group-messages";
import { ConversationAvatar } from "~/components/avatar/conversation-avatar";
import { PRIMARY_GRADIENT_CLASSNAME } from "~/features/conversation/utils/gradient-classnames";
import { useDeleteMessageMutation } from "~/hooks/api/message";
import { getFileExtensionFromUrl } from "~/utils/attachment";
import { formatMessageDateLabel, formatMessageTime } from "~/utils/date";
import { getInitials } from "~/utils/display";

/**
 * `IMAGE` renders inline, never as a link — the backend answers
 * `GET /api/files/{name}` with `Content-Disposition: attachment`, so opening
 * the URL anywhere but an `<img>` downloads it instead of showing it (T2,
 * spec #253, contract §5c). A broken image falls back to the same file card
 * `FILE` renders — the point isn't to render an image, it's to not lose the
 * file behind a dead `<img>`.
 */
function MessageAttachment({ message }: { message: ChatMessage }) {
  const { t } = useTranslation();
  const [imageFailed, setImageFailed] = useState(false);

  if (!message.attachmentUrl) return null;

  if (message.type === ChatMessageType.IMAGE && !imageFailed) {
    return (
      <img
        src={message.attachmentUrl}
        alt={t("chat.attachment.imageAlt")}
        onError={() => setImageFailed(true)}
        className="block max-h-80 max-w-full rounded-lg object-cover"
      />
    );
  }

  const extension = getFileExtensionFromUrl(message.attachmentUrl);
  return (
    <a
      href={message.attachmentUrl}
      download
      className="bg-black/10 hover:bg-black/15 dark:bg-white/10 dark:hover:bg-white/15 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium"
    >
      <FileIcon className="size-5 shrink-0" />
      <span className="truncate">
        {t("chat.attachment.fileLabel", { extension })}
      </span>
    </a>
  );
}

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
    "flex flex-col gap-1.5 rounded-2xl px-3.5 py-2",
    isOwn
      ? [!isFirstInGroup && "rounded-tr-md", !isLastInGroup && "rounded-br-md"]
      : [!isFirstInGroup && "rounded-tl-md", !isLastInGroup && "rounded-bl-md"],
  );
}

/**
 * The "⋯" menu on a visitor's own bubble (T3, spec #253) — "Sửa" only for a
 * TEXT message (BE 400s on anything else), "Xoá" always. Hover reveals it on
 * desktop; it stays dimly visible on touch, where there is no hover to reveal
 * it from. The confirm `AlertDialog` is a SIBLING of the menu, not nested
 * inside `DropdownMenuContent` — the same shape conversation-details-panel.tsx
 * uses, since two overlays fighting over focus is what nesting them causes.
 */
function MessageActionsMenu({
  message,
  onEdit,
}: {
  message: ChatMessage;
  onEdit?: (message: ChatMessage) => void;
}) {
  const { t } = useTranslation();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const deleteMessageMutation = useDeleteMessageMutation();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label={t("chat.convPane.row.actions.menuLabel")}
              className="text-muted-foreground rounded-full opacity-70 transition-opacity group-hover/row:opacity-100 md:opacity-0 md:group-hover/row:opacity-100"
            >
              <MoreHorizontal />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-36">
          {message.type === ChatMessageType.TEXT && (
            <DropdownMenuItem onClick={() => onEdit?.(message)}>
              {t("chat.convPane.row.actions.edit")}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setIsConfirmOpen(true)}
          >
            {t("chat.convPane.row.actions.delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("chat.convPane.row.actions.deleteConfirmTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("chat.convPane.row.actions.deleteConfirmDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("chat.convPane.row.actions.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteMessageMutation.isPending}
              onClick={() => {
                setIsConfirmOpen(false);
                deleteMessageMutation.mutate(message);
              }}
            >
              {deleteMessageMutation.isPending
                ? t("chat.convPane.row.actions.deleting")
                : t("chat.convPane.row.actions.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface MessageRowProps {
  position: MessagePosition;
  senderAvatarUrl?: string;
  /** Group only (T4, brief §10 row 8) — who has read exactly up to this message. */
  readers?: ConversationMember[];
  /** Direct only — the other participant has read at or past this own message. */
  seenByOther?: boolean;
  /** T3 (spec #253) — opens the composer's edit mode on this message. */
  onEdit?: (message: ChatMessage) => void;
}

export default function MessageRow({
  position,
  senderAvatarUrl,
  readers = [],
  seenByOther = false,
  onEdit,
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
            {/* Full-width row, never `self-start`/`self-end`: a shrink-to-fit
                row makes the bubble's percentage max-width resolve against
                its own natural width, so every message wraps at 80% of
                itself instead of 80% of the pane. */}
            <div
              className={cn(
                "group/row flex w-full min-w-0 items-center gap-1",
                isOwn ? "flex-row-reverse" : "flex-row",
              )}
            >
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
                  {message.attachmentUrl && (
                    <MessageAttachment message={message} />
                  )}
                  {/* `wrap-anywhere`, not `break-words`: only the former counts
                      toward min-content, so a pasted token with no spaces (a
                      JWT, a curl line) wraps instead of widening the bubble. */}
                  {message.content && (
                    <p className="wrap-anywhere whitespace-pre-wrap">
                      {message.content}
                    </p>
                  )}
                </BubbleContent>
              </Bubble>
              {isOwn && (
                <MessageActionsMenu message={message} onEdit={onEdit} />
              )}
            </div>
            {isLastInGroup && (
              <MessageFooter className="gap-1.5 px-2 text-[11px] font-normal">
                <span>{formatMessageTime(message.createdAt)}</span>
                {message.updatedAt !== message.createdAt && (
                  <span>{t("chat.convPane.row.edited")}</span>
                )}
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
