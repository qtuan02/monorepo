import { useIsMobile } from "@monorepo/hook/use-is-mobile";

import ConversationList from "~/features/conversation/components/conversation-list";
import ConversationPanel from "~/features/conversation/components/conversation-panel";

interface ConversationShellTemplateProps {
  conversationId?: string;
}

/**
 * The public surface both `HomePage` (`/`) and `ConversationPage`
 * (`/conversation/:conversationId`) render. Below `md` it shows the list OR
 * the panel — never both — so a phone gets the source's list-then-chat flow
 * with no duplicate list mounted off-screen.
 */
export default function ConversationShellTemplate({
  conversationId,
}: ConversationShellTemplateProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return conversationId ? (
      <ConversationPanel conversationId={conversationId} showBackButton />
    ) : (
      <ConversationList activeConversationId={conversationId} />
    );
  }

  return (
    <div className="flex min-h-0 flex-1">
      <div className="border-border flex w-80 shrink-0 flex-col border-r">
        <ConversationList activeConversationId={conversationId} />
      </div>
      <ConversationPanel conversationId={conversationId} />
    </div>
  );
}
