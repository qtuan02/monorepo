import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ChatMessageRecord } from "@monorepo/types/chat-message";
import type { ChatUserProfile } from "@monorepo/types/chat-user";
import {
  ChatConversationType,
  ChatParticipantRole,
} from "@monorepo/types/chat-conversation";
import { ChatMessageType } from "@monorepo/types/chat-message";

import MessageList from "~/features/conversation/components/message-list";
import { appendConversationMessageToCache } from "~/hooks/api/message";
import { useAuthStore } from "~/stores/use-auth-store";

const CURRENT_USER: ChatUserProfile = {
  id: "u1",
  username: "tuanhq02",
  firstName: "Tuan",
  lastName: "Huynh",
};

const { chatUserMe, chatConversationGetConversations, chatMessageGetMessages } =
  vi.hoisted(() => ({
    chatUserMe: vi.fn(),
    chatConversationGetConversations: vi.fn(),
    chatMessageGetMessages: vi.fn(),
  }));

vi.mock("~/libs/http-client", () => ({
  chatUserService: { me: chatUserMe },
  chatConversationService: {
    getConversations: chatConversationGetConversations,
  },
  chatMessageService: { getMessages: chatMessageGetMessages },
}));

// A stand-in for the real `Virtuoso`: renders every `data` row through the
// real `itemContent`/`computeItemKey` with no virtualization and no DOM
// measurement (jsdom can't paint a scroll-to-bottom target — see
// use-conversation-messages.test.tsx), and hands the test direct access to
// `atBottomStateChange` plus a `scrollToIndex` spy through `latestVirtuoso`.
const latestVirtuoso: {
  atBottomStateChange?: (atBottom: boolean) => void;
  scrollToIndex: ReturnType<typeof vi.fn>;
} = { scrollToIndex: vi.fn() };

vi.mock("react-virtuoso", () => ({
  Virtuoso: (props: {
    ref?: { current: unknown };
    data: unknown[];
    firstItemIndex: number;
    computeItemKey: (index: number, item: unknown) => string;
    itemContent: (index: number) => ReactNode;
    atBottomStateChange?: (atBottom: boolean) => void;
  }) => {
    latestVirtuoso.atBottomStateChange = props.atBottomStateChange;
    if (props.ref) {
      props.ref.current = { scrollToIndex: latestVirtuoso.scrollToIndex };
    }
    return (
      <div>
        {props.data.map((item, index) => (
          <div key={props.computeItemKey(props.firstItemIndex + index, item)}>
            {props.itemContent(props.firstItemIndex + index)}
          </div>
        ))}
      </div>
    );
  },
}));

function messageRecord(
  id: string,
  createdAt: string,
  senderId = "u2",
): ChatMessageRecord {
  return {
    id,
    conversationId: "c1",
    senderId,
    content: id,
    type: ChatMessageType.TEXT,
    createdAt,
    updatedAt: createdAt,
  };
}

/** The exact helper the socket provider calls on a live arrival — see chat-socket-provider.tsx. */
async function appendLiveMessage(
  queryClient: QueryClient,
  message: ChatMessageRecord,
) {
  await act(async () => {
    appendConversationMessageToCache(queryClient, message);
  });
}

function renderMessageList(queryClient: QueryClient) {
  render(
    <QueryClientProvider client={queryClient}>
      <MessageList conversationId="c1" />
    </QueryClientProvider>,
  );
}

describe("MessageList — new messages button", () => {
  beforeEach(() => {
    useAuthStore.setState({ token: "a-token" });
    // Cleared, not just the spy — a stale reference from a previous test's
    // (now-unmounted) component would let `waitFor` below resolve instantly
    // against a setter that no longer does anything.
    latestVirtuoso.atBottomStateChange = undefined;
    latestVirtuoso.scrollToIndex.mockReset();
    chatUserMe.mockReset().mockResolvedValue(CURRENT_USER);
    chatConversationGetConversations.mockReset().mockResolvedValue({
      items: [
        {
          id: "c1",
          type: ChatConversationType.DIRECT,
          groupName: null,
          lastMessage: null,
          lastMessageAt: null,
          unreadCount: 0,
          participants: [
            {
              userId: "u1",
              firstName: "Tuan",
              lastName: "Huynh",
              role: ChatParticipantRole.MEMBER,
            },
            {
              userId: "u2",
              firstName: "Lan",
              lastName: "Nguyen",
              role: ChatParticipantRole.MEMBER,
            },
          ],
        },
      ],
      nextCursor: null,
    });
    chatMessageGetMessages.mockReset().mockResolvedValue({
      items: [messageRecord("m1", "2026-09-19T08:00:00.000Z")],
      nextCursor: null,
    });
  });

  it("stays hidden while at the bottom", async () => {
    const queryClient = new QueryClient();
    renderMessageList(queryClient);

    await waitFor(() =>
      expect(latestVirtuoso.atBottomStateChange).toBeDefined(),
    );
    await appendLiveMessage(
      queryClient,
      messageRecord("m2", "2026-09-19T08:01:00.000Z"),
    );

    expect(screen.queryByText(/new message/)).not.toBeInTheDocument();
  });

  it("counts to '2 new messages' once the visitor leaves the bottom, and the button scrolls back + clears it", async () => {
    const user = userEvent.setup();
    const queryClient = new QueryClient();
    renderMessageList(queryClient);

    await waitFor(() =>
      expect(latestVirtuoso.atBottomStateChange).toBeDefined(),
    );
    act(() => latestVirtuoso.atBottomStateChange?.(false));

    await appendLiveMessage(
      queryClient,
      messageRecord("m2", "2026-09-19T08:01:00.000Z"),
    );
    const button = await screen.findByRole("button", { name: "1 new message" });
    expect(button).toBeInTheDocument();
    // The count announces without stealing focus — the region is `polite`.
    expect(button.closest('[aria-live="polite"]')).not.toBeNull();

    await appendLiveMessage(
      queryClient,
      messageRecord("m3", "2026-09-19T08:02:00.000Z"),
    );
    expect(
      await screen.findByRole("button", { name: "2 new messages" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /new messages/ }));

    expect(latestVirtuoso.scrollToIndex).toHaveBeenCalledWith(
      expect.objectContaining({ index: "LAST", align: "end" }),
    );
    expect(screen.queryByText(/new message/)).not.toBeInTheDocument();
  });

  it("clears once the visitor scrolls back to the bottom themselves", async () => {
    const queryClient = new QueryClient();
    renderMessageList(queryClient);

    await waitFor(() =>
      expect(latestVirtuoso.atBottomStateChange).toBeDefined(),
    );
    act(() => latestVirtuoso.atBottomStateChange?.(false));

    await appendLiveMessage(
      queryClient,
      messageRecord("m2", "2026-09-19T08:01:00.000Z"),
    );
    expect(
      await screen.findByRole("button", { name: "1 new message" }),
    ).toBeInTheDocument();

    act(() => latestVirtuoso.atBottomStateChange?.(true));

    expect(screen.queryByText(/new message/)).not.toBeInTheDocument();
  });
});

describe("MessageList — 'Seen' placement", () => {
  beforeEach(() => {
    useAuthStore.setState({ token: "a-token" });
    latestVirtuoso.atBottomStateChange = undefined;
    latestVirtuoso.scrollToIndex.mockReset();
    chatUserMe.mockReset().mockResolvedValue(CURRENT_USER);
  });

  it("shows 'Seen' only under the visitor's LAST own message, not every earlier own group", async () => {
    chatConversationGetConversations.mockReset().mockResolvedValue({
      items: [
        {
          id: "c1",
          type: ChatConversationType.DIRECT,
          groupName: null,
          lastMessage: null,
          lastMessageAt: null,
          unreadCount: 0,
          participants: [
            {
              userId: "u1",
              firstName: "Tuan",
              lastName: "Huynh",
              role: ChatParticipantRole.MEMBER,
            },
            {
              userId: "u2",
              firstName: "Lan",
              lastName: "Nguyen",
              role: ChatParticipantRole.MEMBER,
              // Read past both of the visitor's messages, with the other
              // participant's own reply sitting between them.
              lastReadAt: "2026-09-19T08:03:00.000Z",
            },
          ],
        },
      ],
      nextCursor: null,
    });
    // Newest-first within the page — see hooks/api/message.ts.
    chatMessageGetMessages.mockReset().mockResolvedValue({
      items: [
        messageRecord("m3", "2026-09-19T08:02:00.000Z", "u1"),
        messageRecord("m2", "2026-09-19T08:01:00.000Z", "u2"),
        messageRecord("m1", "2026-09-19T08:00:00.000Z", "u1"),
      ],
      nextCursor: null,
    });

    render(
      <QueryClientProvider client={new QueryClient()}>
        <MessageList conversationId="c1" />
      </QueryClientProvider>,
    );

    await screen.findByText("m3");
    // Only m3 (the visitor's actual last message) gets it — not m1, whose
    // own group also has isLastInGroup=true.
    expect(screen.getAllByRole("img", { name: "Seen" })).toHaveLength(1);
  });
});
