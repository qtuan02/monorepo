import { X } from "lucide-react";

import { useIsMobile } from "@monorepo/hook/use-is-mobile";
import { ChatConversationType } from "@monorepo/types/chat-conversation";
import { Button } from "@monorepo/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@monorepo/ui/components/sheet";

import type { Conversation } from "~/features/conversation/types/conversation";
import { ConversationAvatar } from "~/components/avatar/conversation-avatar";
import GroupPanelTemplate from "~/features/group/templates/group-panel.template";
import { useUserInfoQuery } from "~/hooks/api/user";

interface ConversationDetailsPanelProps {
  conversation: Conversation;
  open: boolean;
  onClose: () => void;
  /** Group conversations navigate Home once the visitor leaves. */
  onLeftGroup: () => void;
}

function DirectProfileSection({
  conversation,
}: {
  conversation: Conversation;
}) {
  const otherMember = conversation.members.find(
    (member) => member.userId !== conversation.currentUserId,
  );
  const userInfoQuery = useUserInfoQuery(otherMember?.userId);

  if (!otherMember) return null;

  return (
    <section className="grid gap-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <ConversationAvatar
          title={otherMember.displayName}
          avatarUrl={otherMember.avatarUrl}
        />
        <div>
          <p className="text-base font-semibold">{otherMember.displayName}</p>
          {otherMember.username && (
            <p className="text-muted-foreground text-xs">
              @{otherMember.username}
            </p>
          )}
        </div>
      </div>

      {userInfoQuery.data?.bio && (
        <p className="bg-muted/40 rounded-xl px-3 py-2.5 text-sm">
          {userInfoQuery.data.bio}
        </p>
      )}
    </section>
  );
}

function ConversationDetailsContent({
  conversation,
  onLeftGroup,
}: {
  conversation: Conversation;
  onLeftGroup: () => void;
}) {
  return conversation.type === ChatConversationType.GROUP ? (
    <GroupPanelTemplate conversation={conversation} onLeft={onLeftGroup} />
  ) : (
    <DirectProfileSection conversation={conversation} />
  );
}

/**
 * Desktop renders a persistent third column beside the conversation panel;
 * mobile renders the same content in a Sheet, so neither surface duplicates
 * the group/direct branching in `ConversationDetailsContent`.
 */
export function ConversationDetailsPanel({
  conversation,
  open,
  onClose,
  onLeftGroup,
}: ConversationDetailsPanelProps) {
  const isMobile = useIsMobile();
  const title =
    conversation.type === ChatConversationType.GROUP ? "Group info" : "Profile";

  if (isMobile) {
    return (
      <Sheet
        open={open}
        onOpenChange={(next) => {
          if (!next) onClose();
        }}
      >
        <SheetContent side="right" className="overflow-y-auto p-4">
          <SheetHeader className="p-0">
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
          <ConversationDetailsContent
            conversation={conversation}
            onLeftGroup={onLeftGroup}
          />
        </SheetContent>
      </Sheet>
    );
  }

  if (!open) return null;

  return (
    <div className="border-border flex h-full w-80 shrink-0 flex-col gap-4 overflow-y-auto border-l p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">{title}</h2>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          onClick={onClose}
          aria-label="Close details"
        >
          <X className="size-4" />
        </Button>
      </div>
      <ConversationDetailsContent
        conversation={conversation}
        onLeftGroup={onLeftGroup}
      />
    </div>
  );
}
