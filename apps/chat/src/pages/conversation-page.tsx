import { useParams } from "react-router";

import ConversationShellTemplate from "~/features/conversation/templates/conversation-shell.template";

export default function ConversationPage() {
  const { conversationId } = useParams<{ conversationId: string }>();

  if (!conversationId) return null;

  return <ConversationShellTemplate conversationId={conversationId} />;
}
