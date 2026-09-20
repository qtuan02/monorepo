import * as React from "react";

import { useIsMobile } from "@monorepo/hook/use-is-mobile";
import { cn } from "@monorepo/ui/utils/cn";

import { Island } from "~/components/island/island";
import ConversationList from "~/features/conversation/components/conversation-list";
import ConversationPanel from "~/features/conversation/components/conversation-panel";
import { useDirectMessageDraft } from "~/hooks/use-direct-message-draft";

interface ConversationShellTemplateProps {
  conversationId?: string;
}

/**
 * The public surface both `HomePage` (`/`) and `ConversationPage`
 * (`/conversation/:conversationId`) render. Below `md` it shows the list OR
 * the panel — never both — so a phone gets the source's list-then-chat flow
 * with no duplicate list mounted off-screen. From `md` the list is its own
 * Island beside the pane's, and Details a third one when open (brief §10 row
 * 19) — `LayoutTemplate` hands this screen the bare column for that reason.
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

  const panel = showDraft ? (
    <ConversationPanel
      draftUser={showDraft}
      showBackButton={isMobile}
      detailsOpen={isDetailsOpen}
      onDetailsOpenChange={setIsDetailsOpen}
    />
  ) : (
    <ConversationPanel
      conversationId={conversationId}
      showBackButton={isMobile}
      detailsOpen={isDetailsOpen}
      onDetailsOpenChange={setIsDetailsOpen}
    />
  );

  if (isMobile) {
    if (conversationId || showDraft) return panel;
    return (
      <Island className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <ConversationList activeConversationId={conversationId} />
      </Island>
    );
  }

  return (
    <>
      {/* Between `md` and `lg` three Islands do not fit — the open Details
          takes the list's column rather than squeezing the pane. */}
      <Island
        className={cn(
          "flex w-80 shrink-0 flex-col overflow-hidden",
          isDetailsOpen && (conversationId || showDraft) && "max-lg:hidden",
        )}
      >
        <ConversationList activeConversationId={conversationId} />
      </Island>
      {panel}
    </>
  );
}
