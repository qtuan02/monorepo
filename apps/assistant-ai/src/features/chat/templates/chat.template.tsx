"use client";

import { useState } from "react";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import {
  AssistantChatTransport,
  useChatRuntime,
} from "@assistant-ui/react-ai-sdk";
import { useLocale } from "next-intl";

import { useModelStore } from "~/stores/use-model-store";
import { Thread } from "../components/thread/thread";
import { CHAT_API_PATH } from "../constants/endpoints";

/**
 * The chat screen, and the slice's whole public surface.
 *
 * A Client Component because the runtime it provides is a browser object: it
 * owns the message list, the streaming state and the abort controller. Nothing
 * above it in the tree becomes client — `page.tsx` renders it as a leaf.
 */
export default function ChatTemplate() {
  const locale = useLocale();

  // Built once, not on every render: `AssistantChatTransport` holds the runtime
  // it was wired to, so handing `useChatRuntime` a fresh instance per render
  // would rebuild the transport under a live stream. The model is therefore read
  // *at send time* through the store's imperative getter rather than captured in
  // a `body` literal — which is also what makes switching model mid-conversation
  // take effect on the next turn instead of the next remount.
  const [transport] = useState(
    () =>
      new AssistantChatTransport({
        api: CHAT_API_PATH,
        // Returning a `body` **replaces** the one the transport would have
        // built, rather than merging into it — so the fields the AI SDK sends
        // are re-listed here alongside this app's two. `body` on the way in
        // already carries what assistant-ui adds (`system`, `tools`,
        // `callSettings`), which is why it is spread first.
        prepareSendMessagesRequest: ({
          api,
          body,
          credentials,
          headers,
          id,
          messageId,
          messages,
          requestMetadata,
          trigger,
        }) => ({
          api,
          credentials,
          headers,
          body: {
            ...body,
            id,
            messages,
            trigger,
            messageId,
            metadata: requestMetadata,
            model: useModelStore.getState().selectedModel,
            locale,
          },
        }),
      }),
  );

  const runtime = useChatRuntime({ transport });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {/* `min-h-0` on every link of the chain: a flex child defaults to
          `min-height: auto`, so without it the scrolling viewport inside the
          thread grows the page instead of scrolling. */}
      <div className="flex min-h-0 w-full flex-1">
        <div className="min-w-0 flex-1 overflow-hidden">
          <Thread />
        </div>
      </div>
    </AssistantRuntimeProvider>
  );
}
