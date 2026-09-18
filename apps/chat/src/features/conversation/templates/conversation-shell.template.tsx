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
 */
export default function ConversationShellTemplate({
  conversationId,
}: ConversationShellTemplateProps) {
  const isMobile = useIsMobile();
  const draftUser = useDirectMessageDraft();
  const showDraft = !conversationId && draftUser;

  if (isMobile) {
    if (conversationId) {
      return (
        <ConversationPanel conversationId={conversationId} showBackButton />
      );
    }
    if (showDraft) {
      return <ConversationPanel draftUser={showDraft} showBackButton />;
    }
    return <ConversationList activeConversationId={conversationId} />;
  }

  return (
    <div className="flex min-h-0 flex-1">
      <div className="border-border flex w-80 shrink-0 flex-col border-r">
        <ConversationList activeConversationId={conversationId} />
      </div>
      {showDraft ? (
        <ConversationPanel draftUser={showDraft} />
      ) : (
        <ConversationPanel conversationId={conversationId} />
      )}
    </div>
  );
}
