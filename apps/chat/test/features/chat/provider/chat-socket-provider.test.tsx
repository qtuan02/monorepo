import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ChatConversationRecord } from "@monorepo/types/chat-conversation";
import {
  ChatConversationType,
  ChatParticipantRole,
} from "@monorepo/types/chat-conversation";
import { ChatMessageType } from "@monorepo/types/chat-message";
import { ChatSocketEventType } from "@monorepo/types/chat-socket";

import { conversationQueryKeys } from "~/hooks/api/conversation";
import { messageQueryKeys } from "~/hooks/api/message";

const { chatUserMe, chatConversationMarkAsSeen } = vi.hoisted(() => ({
  chatUserMe: vi.fn(),
  chatConversationMarkAsSeen: vi.fn(),
}));

vi.mock("~/libs/http-client", () => ({
  chatUserService: { me: chatUserMe },
  chatConversationService: { markAsSeen: chatConversationMarkAsSeen },
}));

vi.mock("~/libs/socket", () => ({
  subscribeToConversationUpdates: vi.fn(() => vi.fn()),
  subscribeToConversationMessages: vi.fn(() => vi.fn()),
}));

// A connected fake client — the provider only branches on `client`/`isConnected`,
// never calls into it directly (that's `~/libs/socket`'s job, mocked above).
vi.mock("~/stores/use-socket-store", () => ({
  useSocketStore: (
    selector: (state: { client: object; isConnected: boolean }) => unknown,
  ) => selector({ client: {}, isConnected: true }),
}));

import { ChatSocketProvider } from "~/features/chat/provider/chat-socket-provider";
// Imported AFTER the mocks above so it picks up the mocked implementations.
import {
  subscribeToConversationMessages,
  subscribeToConversationUpdates,
} from "~/libs/socket";
import { useAuthStore } from "~/stores/use-auth-store";

const CURRENT_USER_ID = "u1";
const OTHER_USER_ID = "u2";

const MESSAGE_FROM_OTHER_USER = {
  id: "m2",
  conversationId: "c1",
  senderId: OTHER_USER_ID,
  content: "New message",
  type: ChatMessageType.TEXT,
  createdAt: "2026-09-19T00:01:00.000Z",
  updatedAt: "2026-09-19T00:01:00.000Z",
};

function conversationRecord(): ChatConversationRecord {
  return {
    id: "c1",
    type: ChatConversationType.DIRECT,
    groupName: null,
    lastMessage: null,
    lastMessageAt: null,
    unreadCount: 0,
    participants: [
      {
        userId: CURRENT_USER_ID,
        firstName: "Tuan",
        lastName: "Huynh",
        role: ChatParticipantRole.MEMBER,
      },
      {
        userId: OTHER_USER_ID,
        firstName: "Lan",
        lastName: "Nguyen",
        role: ChatParticipantRole.MEMBER,
      },
    ],
  };
}

function renderProvider(queryClient: QueryClient, activeConversationId = "c1") {
  return render(
    <QueryClientProvider client={queryClient}>
      <ChatSocketProvider activeConversationId={activeConversationId}>
        <span>children</span>
      </ChatSocketProvider>
    </QueryClientProvider>,
  );
}

/** The handler most recently handed to the mocked subscribe function. */
function latestUpdatesHandler() {
  const calls = vi.mocked(subscribeToConversationUpdates).mock.calls;
  return calls.at(-1)?.[1];
}

function latestMessagesHandler() {
  const calls = vi.mocked(subscribeToConversationMessages).mock.calls;
  return calls.at(-1)?.[2];
}

describe("ChatSocketProvider", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    chatUserMe.mockReset().mockResolvedValue({
      id: CURRENT_USER_ID,
      username: "tuanhq",
      firstName: "Tuan",
      lastName: "Huynh",
    });
    chatConversationMarkAsSeen.mockReset().mockResolvedValue(undefined);
    vi.mocked(subscribeToConversationUpdates).mockClear();
    vi.mocked(subscribeToConversationMessages).mockClear();
    // `useCurrentUserQuery()` gates on a token — see hooks/api/user.ts.
    useAuthStore.setState({ token: "a-token" });
  });

  it("appends an incoming message to the conversation's message history", async () => {
    queryClient.setQueryData(messageQueryKeys.byConversation("c1"), {
      pages: [{ items: [], nextCursor: null }],
      pageParams: [undefined],
    });

    renderProvider(queryClient);

    await waitFor(() => expect(latestMessagesHandler()).toBeDefined());
    latestMessagesHandler()?.(MESSAGE_FROM_OTHER_USER);

    const cached = queryClient.getQueryData<{
      pages: Array<{ items: Array<{ id: string }> }>;
    }>(messageQueryKeys.byConversation("c1"));
    expect(cached?.pages[0]?.items).toEqual([MESSAGE_FROM_OTHER_USER]);
  });

  it("marks the open conversation seen exactly once when a message arrives from someone else", async () => {
    queryClient.setQueryData(messageQueryKeys.byConversation("c1"), {
      pages: [{ items: [], nextCursor: null }],
      pageParams: [undefined],
    });

    renderProvider(queryClient);

    // The effect resubscribes once `useCurrentUserQuery()` resolves and
    // `currentUserId` moves off `undefined` — grabbing the handler before
    // that closes over a sender check that can never be "someone else".
    await waitFor(() => expect(chatUserMe).toHaveBeenCalled());
    await waitFor(() =>
      expect(
        vi.mocked(subscribeToConversationMessages).mock.calls.length,
      ).toBeGreaterThanOrEqual(2),
    );
    latestMessagesHandler()?.(MESSAGE_FROM_OTHER_USER);

    await waitFor(() =>
      expect(chatConversationMarkAsSeen).toHaveBeenCalledTimes(1),
    );
    expect(chatConversationMarkAsSeen).toHaveBeenCalledWith("c1");
  });

  it("does not mark seen when the incoming message is my own echo", async () => {
    queryClient.setQueryData(messageQueryKeys.byConversation("c1"), {
      pages: [{ items: [], nextCursor: null }],
      pageParams: [undefined],
    });

    renderProvider(queryClient);

    await waitFor(() => expect(chatUserMe).toHaveBeenCalled());
    await waitFor(() =>
      expect(
        vi.mocked(subscribeToConversationMessages).mock.calls.length,
      ).toBeGreaterThanOrEqual(2),
    );
    latestMessagesHandler()?.({
      ...MESSAGE_FROM_OTHER_USER,
      id: "m3",
      senderId: CURRENT_USER_ID,
    });

    expect(chatConversationMarkAsSeen).not.toHaveBeenCalled();
  });

  it("applies a conversation.seen event onto the participant's read receipt", async () => {
    queryClient.setQueryData(conversationQueryKeys.lists(), {
      pages: [{ items: [conversationRecord()], nextCursor: null }],
      pageParams: [undefined],
    });

    renderProvider(queryClient);

    await waitFor(() => expect(latestUpdatesHandler()).toBeDefined());
    latestUpdatesHandler()?.({
      eventType: ChatSocketEventType.CONVERSATION_SEEN,
      conversationId: "c1",
      seenByUserId: OTHER_USER_ID,
      lastReadMessageId: "m1",
      lastReadAt: "2026-09-19T00:02:00.000Z",
    });

    const cached = queryClient.getQueryData<{
      pages: Array<{ items: ChatConversationRecord[] }>;
    }>(conversationQueryKeys.lists());
    const otherParticipant = cached?.pages[0]?.items[0]?.participants.find(
      (participant) => participant.userId === OTHER_USER_ID,
    );
    expect(otherParticipant?.lastReadMessageId).toBe("m1");
    expect(otherParticipant?.lastReadAt).toBe("2026-09-19T00:02:00.000Z");
  });
});
