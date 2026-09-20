import type { Client } from "@stomp/stompjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ChatConversationRecord } from "@monorepo/types/chat-conversation";
import {
  ChatConversationType,
  ChatParticipantRole,
} from "@monorepo/types/chat-conversation";
import { ChatMessageType } from "@monorepo/types/chat-message";
import { ChatSocketEventType } from "@monorepo/types/chat-socket";

import { ROUTES } from "~/constants/routes";
import { conversationQueryKeys } from "~/hooks/api/conversation";
import { messageQueryKeys } from "~/hooks/api/message";

const { chatUserMe, chatConversationMarkAsSeen, toastAdd } = vi.hoisted(() => ({
  chatUserMe: vi.fn(),
  chatConversationMarkAsSeen: vi.fn(),
  toastAdd: vi.fn(),
}));

vi.mock("~/libs/http-client", () => ({
  chatUserService: { me: chatUserMe },
  chatConversationService: { markAsSeen: chatConversationMarkAsSeen },
}));

vi.mock("~/libs/socket", () => ({
  subscribeToConversationUpdates: vi.fn(() => vi.fn()),
  subscribeToConversationMessages: vi.fn(() => vi.fn()),
}));

vi.mock("@monorepo/ui/components/toast", () => ({
  toast: { add: toastAdd },
}));

// A real store, connected by default — the provider only branches on
// `client`/`isConnected`, never calls into it directly (that's
// `~/libs/socket`'s job, mocked above). A real store (rather than a fixed
// selector result) lets a test flip `isConnected` with `.setState(...)`.
vi.mock("~/stores/use-socket-store", async () => {
  const { create } = await import("zustand");
  return {
    useSocketStore: create(() => ({ client: {} as Client, isConnected: true })),
  };
});

import { ChatSocketProvider } from "~/features/chat/provider/chat-socket-provider";
// Imported AFTER the mocks above so it picks up the mocked implementations.
import {
  subscribeToConversationMessages,
  subscribeToConversationUpdates,
} from "~/libs/socket";
import { useAuthStore } from "~/stores/use-auth-store";
import { useSocketStore } from "~/stores/use-socket-store";

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

const MESSAGE_CREATED_EVENT = {
  eventType: ChatSocketEventType.MESSAGE_CREATED,
  message: MESSAGE_FROM_OTHER_USER,
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
        username: "tuanhq02",
        firstName: "Tuan",
        lastName: "Huynh",
        role: ChatParticipantRole.MEMBER,
      },
      {
        userId: OTHER_USER_ID,
        username: "lan",
        firstName: "Lan",
        lastName: "Nguyen",
        role: ChatParticipantRole.MEMBER,
      },
    ],
  };
}

/**
 * Wrapped in a router so `useNavigate()` doesn't throw, and so the removed-
 * conversation test can assert the redirect actually happened rather than
 * just that `navigate` was called with the right arguments.
 */
function renderProvider(queryClient: QueryClient, activeConversationId = "c1") {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/conversation/c1"]}>
        <Routes>
          <Route path={ROUTES.HOME} element={<span>home screen</span>} />
          <Route
            path="*"
            element={
              <ChatSocketProvider activeConversationId={activeConversationId}>
                <span>children</span>
              </ChatSocketProvider>
            }
          />
        </Routes>
      </MemoryRouter>
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
    toastAdd.mockClear();
    vi.mocked(subscribeToConversationUpdates).mockClear();
    vi.mocked(subscribeToConversationMessages).mockClear();
    // `useCurrentUserQuery()` gates on a token — see hooks/api/user.ts.
    useAuthStore.setState({ token: "a-token" });
    useSocketStore.setState({ client: {} as Client, isConnected: true });
  });

  it("appends an incoming message to the conversation's message history", async () => {
    queryClient.setQueryData(messageQueryKeys.byConversation("c1"), {
      pages: [{ items: [], nextCursor: null }],
      pageParams: [undefined],
    });

    renderProvider(queryClient);

    await waitFor(() => expect(latestMessagesHandler()).toBeDefined());
    latestMessagesHandler()?.(MESSAGE_CREATED_EVENT);

    const cached = queryClient.getQueryData<{
      pages: Array<{ items: Array<{ id: string }> }>;
    }>(messageQueryKeys.byConversation("c1"));
    expect(cached?.pages[0]?.items).toEqual([MESSAGE_FROM_OTHER_USER]);
  });

  it("removes a deleted message from the conversation's message history", async () => {
    queryClient.setQueryData(messageQueryKeys.byConversation("c1"), {
      pages: [{ items: [MESSAGE_FROM_OTHER_USER], nextCursor: null }],
      pageParams: [undefined],
    });

    renderProvider(queryClient);

    await waitFor(() => expect(latestMessagesHandler()).toBeDefined());
    latestMessagesHandler()?.({
      eventType: ChatSocketEventType.MESSAGE_DELETED,
      message: MESSAGE_FROM_OTHER_USER,
    });

    const cached = queryClient.getQueryData<{
      pages: Array<{ items: Array<{ id: string }> }>;
    }>(messageQueryKeys.byConversation("c1"));
    expect(cached?.pages[0]?.items).toEqual([]);
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
    latestMessagesHandler()?.(MESSAGE_CREATED_EVENT);

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
      eventType: ChatSocketEventType.MESSAGE_CREATED,
      message: {
        ...MESSAGE_FROM_OTHER_USER,
        id: "m3",
        senderId: CURRENT_USER_ID,
      },
    });

    expect(chatConversationMarkAsSeen).not.toHaveBeenCalled();
  });

  it("does not mark seen for an edited (message.updated) message", async () => {
    queryClient.setQueryData(messageQueryKeys.byConversation("c1"), {
      pages: [{ items: [MESSAGE_FROM_OTHER_USER], nextCursor: null }],
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
      eventType: ChatSocketEventType.MESSAGE_UPDATED,
      message: { ...MESSAGE_FROM_OTHER_USER, content: "edited" },
    });

    expect(chatConversationMarkAsSeen).not.toHaveBeenCalled();
    const cached = queryClient.getQueryData<{
      pages: Array<{ items: Array<{ content: string }> }>;
    }>(messageQueryKeys.byConversation("c1"));
    expect(cached?.pages[0]?.items[0]?.content).toBe("edited");
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

  it("upserts a conversation.updated record that was never in the list before", async () => {
    queryClient.setQueryData(conversationQueryKeys.lists(), {
      pages: [{ items: [], nextCursor: null }],
      pageParams: [undefined],
    });

    renderProvider(queryClient);

    await waitFor(() => expect(latestUpdatesHandler()).toBeDefined());
    const newConversation = { ...conversationRecord(), id: "c2" };
    latestUpdatesHandler()?.({
      eventType: ChatSocketEventType.CONVERSATION_UPDATED,
      conversation: newConversation,
    });

    const cached = queryClient.getQueryData<{
      pages: Array<{ items: ChatConversationRecord[] }>;
    }>(conversationQueryKeys.lists());
    expect(cached?.pages[0]?.items).toEqual([newConversation]);
  });

  it("removes a conversation.removed record from the list without navigating away", async () => {
    queryClient.setQueryData(conversationQueryKeys.lists(), {
      pages: [{ items: [conversationRecord()], nextCursor: null }],
      pageParams: [undefined],
    });

    // Active conversation is a different one, so the visitor stays put.
    renderProvider(queryClient, "some-other-conversation");

    await waitFor(() => expect(latestUpdatesHandler()).toBeDefined());
    latestUpdatesHandler()?.({
      eventType: ChatSocketEventType.CONVERSATION_REMOVED,
      conversationId: "c1",
    });

    const cached = queryClient.getQueryData<{
      pages: Array<{ items: ChatConversationRecord[] }>;
    }>(conversationQueryKeys.lists());
    expect(cached?.pages[0]?.items).toEqual([]);
    expect(screen.queryByText("home screen")).not.toBeInTheDocument();
    expect(toastAdd).not.toHaveBeenCalled();
  });

  it("navigates home with a toast when the removed conversation is the one open", async () => {
    queryClient.setQueryData(conversationQueryKeys.lists(), {
      pages: [{ items: [conversationRecord()], nextCursor: null }],
      pageParams: [undefined],
    });

    renderProvider(queryClient, "c1");

    await waitFor(() => expect(latestUpdatesHandler()).toBeDefined());
    latestUpdatesHandler()?.({
      eventType: ChatSocketEventType.CONVERSATION_REMOVED,
      conversationId: "c1",
    });

    expect(await screen.findByText("home screen")).toBeInTheDocument();
    expect(toastAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "You're no longer in this conversation.",
      }),
    );
  });

  it("subscribes to neither topic while the store reports disconnected", async () => {
    useSocketStore.setState({ isConnected: false });

    renderProvider(queryClient);

    // Give the effects a turn to run, then prove they took the early-return
    // branch — `!client || !isConnected` — rather than merely not having
    // fired yet.
    await waitFor(() => expect(chatUserMe).toHaveBeenCalled());
    expect(subscribeToConversationUpdates).not.toHaveBeenCalled();
    expect(subscribeToConversationMessages).not.toHaveBeenCalled();
  });
});
