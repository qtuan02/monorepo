import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";

import { ChatSkeleton } from "~/features/chat/components/chat.skeleton";
import ChatTemplate from "~/features/chat/templates/chat.template";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();

  return {
    // No `title` of its own: the layout's `title.default` is already this app's
    // name, so setting it here would render it twice through the `%s · …`
    // template.
    description: t("assistantAi.meta.description"),
  };
}

/**
 * The public page, and the whole of it. The chat surface is a client island the
 * slice owns; this module only names it, exactly like every other route module
 * in the app.
 *
 * The `<Suspense>` is load-bearing rather than cosmetic — see
 * `ChatSkeleton`'s own note. Without it `next build` fails on the assistant
 * runtime's `Math.random()` id generation.
 */
export default function ChatPage() {
  return (
    <Suspense fallback={<ChatSkeleton />}>
      <ChatTemplate />
    </Suspense>
  );
}
