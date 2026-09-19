import * as React from "react";

import { useIsMobile } from "@monorepo/hook/use-is-mobile";

import ConversationList from "~/features/conversation/components/conversation-list";
import ConversationPanel from "~/features/conversation/components/conversation-panel";
import { useDirectMessageDraft } from "~/features/conversation/hooks/use-direct-message-draft";

interface ConversationShellTemplateProps {
  conversationId?: string;
}

/**
 * The public surface both `HomePage` (`/`) and `ConversationPage`
 * (`/conversation/:conversationId`) render. Below `md` it shows the list OR
 * the panel — never both — so a phone gets the source's list-then-chat flow
 * with no duplicate list mounted off-screen.
 *
 * A Draft conversation (CONTEXT.md) only ever shows on Home — a real
 * `conversationId` always wins, so it never overrides an actual screen.
 *
 * The Details open/close flag lives here, not in `ConversationPanel` — this
 * is the one ancestor that stays mounted across a conversationId switch, so
 * opening Details on A and navigating to B keeps it open (brief §10 row 12,
 * story 44). It is session-scoped local state on purpose, not a store.
 */
export default function ConversationShellTemplate({
  conversationId,
}: ConversationShellTemplateProps) {
  const isMobile = useIsMobile();
  const draftUser = useDirectMessageDraft();
  const showDraft = !conversationId && draftUser;
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);

  if (isMobile) {
    if (conversationId) {
      return (
        <ConversationPanel
          conversationId={conversationId}
          showBackButton
          detailsOpen={isDetailsOpen}
          onDetailsOpenChange={setIsDetailsOpen}
        />
      );
    }
    if (showDraft) {
      return (
        <ConversationPanel
          draftUser={showDraft}
          showBackButton
          detailsOpen={isDetailsOpen}
          onDetailsOpenChange={setIsDetailsOpen}
        />
      );
    }
    return <ConversationList activeConversationId={conversationId} />;
  }

  return (
    <div className="flex min-h-0 flex-1">
      <div className="border-border flex w-80 shrink-0 flex-col border-r">
        <ConversationList activeConversationId={conversationId} />
      </div>
      {showDraft ? (
        <ConversationPanel
          draftUser={showDraft}
          detailsOpen={isDetailsOpen}
          onDetailsOpenChange={setIsDetailsOpen}
        />
      ) : (
        <ConversationPanel
          conversationId={conversationId}
          detailsOpen={isDetailsOpen}
          onDetailsOpenChange={setIsDetailsOpen}
        />
      )}
    </div>
  );
}
