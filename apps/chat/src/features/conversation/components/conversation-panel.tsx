import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";

import { buttonVariants } from "@monorepo/ui/components/button";
import { cn } from "@monorepo/ui/utils/cn";

import { ConversationAvatar } from "~/components/avatar/conversation-avatar";
import { ROUTES } from "~/constants/routes";
import MessageList from "~/features/conversation/components/message-list";
import { useConversationList } from "~/features/conversation/hooks/use-conversation-list";

interface ConversationPanelProps {
  conversationId?: string;
  showBackButton?: boolean;
}

export default function ConversationPanel({
  conversationId,
  showBackButton,
}: ConversationPanelProps) {
  const { conversations } = useConversationList();
  const conversation = conversations.find((item) => item.id === conversationId);

  if (!conversationId) {
    return (
      <div className="flex h-full flex-1 items-center justify-center p-6">
        <p className="text-muted-foreground text-sm">
          Pick a conversation to begin.
        </p>
      </div>
    );
  }

  const title = conversation?.title ?? "Conversation";

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <header className="border-border flex items-center gap-2 border-b px-3 py-2">
        {showBackButton && (
          // A control that navigates is a styled Link, never a Button
          // rendering one — see .agents/rules/architecture-ui-primitives.md.
          <Link
            to={ROUTES.HOME}
            aria-label="Back to conversations"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
          >
            <ArrowLeft className="size-4" />
          </Link>
        )}
        <ConversationAvatar title={title} avatarUrl={conversation?.avatarUrl} />
        <h1 className="truncate text-sm font-semibold">{title}</h1>
      </header>
      <div className="min-h-0 flex-1">
        <MessageList conversationId={conversationId} />
      </div>
    </div>
  );
}
