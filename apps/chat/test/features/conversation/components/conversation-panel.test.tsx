import type { Client } from "@stomp/stompjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ChatConversationRecord } from "@monorepo/types/chat-conversation";
import type { ChatTypingEvent } from "@monorepo/types/chat-socket";
import type { ChatUserProfile } from "@monorepo/types/chat-user";
import { HttpError } from "@monorepo/api/client";
import {
  ChatConversationType,
  ChatParticipantRole,
} from "@monorepo/types/chat-conversation";
import { ChatSocketEventType } from "@monorepo/types/chat-socket";

import ConversationPanel from "~/features/conversation/components/conversation-panel";
import { useAuthStore } from "~/stores/use-auth-store";
import { useSocketStore } from "~/stores/use-socket-store";

const CURRENT_USER: ChatUserProfile = {
  id: "u1",
  username: "tuanhq02",
  firstName: "Tuan",
  lastName: "Huynh",
};

const {
  chatUserMe,
  chatConversationGetConversations,
  chatConversationGetConversation,
  chatConversationMarkAsSeen,
  subscribeToTyping,
} = vi.hoisted(() => ({
  chatUserMe: vi.fn(),
  chatConversationGetConversations: vi.fn(),
  chatConversationGetConversation: vi.fn(),
  chatConversationMarkAsSeen: vi.fn(),
  subscribeToTyping: vi.fn(
    (
      _client: Client,
      _conversationId: string,
      _onTyping: (event: ChatTypingEvent) => void,
    ) => vi.fn(),
  ),
}));

vi.mock("~/libs/http-client", () => ({
  chatUserService: { me: chatUserMe },
  chatConversationService: {
    getConversations: chatConversationGetConversations,
    getConversation: chatConversationGetConversation,
    markAsSeen: chatConversationMarkAsSeen,
  },
}));

// Only the typing seam is reached from this tree — MessageComposer's own
// sendTyping isn't exercised by any test below, so it's left real (a no-op
// on the fake client the store below hands it).
vi.mock("~/libs/socket", async (importOriginal) => ({
  ...(await importOriginal<typeof import("~/libs/socket")>()),
  subscribeToTyping,
}));

vi.mock("~/stores/use-socket-store", async () => {
  const { create } = await import("zustand");
  return {
    useSocketStore: create(() => ({
      client: null,
      isConnected: false,
      onlineUsers: [] as string[],
    })),
  };
});

function conversationRecord(): ChatConversationRecord {
  return {
    id: "c9",
    type: ChatConversationType.DIRECT,
    groupName: null,
    lastMessage: null,
    lastMessageAt: null,
    unreadCount: 0,
    participants: [
      {
        userId: "u1",
        username: "tuanhq02",
        firstName: "Tuan",
        lastName: "Huynh",
        role: ChatParticipantRole.MEMBER,
      },
      {
        userId: "u2",
        username: "lan",
        firstName: "Lan",
        lastName: "Nguyen",
        role: ChatParticipantRole.MEMBER,
      },
    ],
  };
}

function renderPanel(conversationId: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/conversation/${conversationId}`]}>
        <ConversationPanel
          conversationId={conversationId}
          detailsOpen={false}
          onDetailsOpenChange={() => {}}
        />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("ConversationPanel — marks an opened conversation seen", () => {
  beforeEach(() => {
    useAuthStore.setState({ token: "a-token" });
    chatUserMe.mockReset().mockResolvedValue(CURRENT_USER);
    chatConversationGetConversation.mockReset();
    chatConversationMarkAsSeen.mockReset().mockResolvedValue(undefined);
  });

  it("calls markAsSeen once when the opened conversation has unread messages", async () => {
    chatConversationGetConversations.mockReset().mockResolvedValue({
      items: [{ ...conversationRecord(), unreadCount: 3 }],
      nextCursor: null,
    });

    renderPanel("c9");

    await waitFor(() =>
      expect(chatConversationMarkAsSeen).toHaveBeenCalledWith("c9"),
    );
    // onSuccess zeroes the cached count, so the effect must not re-fire.
    await screen.findByLabelText("Message composer");
    expect(chatConversationMarkAsSeen).toHaveBeenCalledTimes(1);
  });

  it("does not call markAsSeen when there is nothing unread", async () => {
    chatConversationGetConversations.mockReset().mockResolvedValue({
      items: [conversationRecord()],
      nextCursor: null,
    });

    renderPanel("c9");

    await screen.findByLabelText("Message composer");
    expect(chatConversationMarkAsSeen).not.toHaveBeenCalled();
  });
});

describe("ConversationPanel — deep-link fallback", () => {
  beforeEach(() => {
    chatUserMe.mockReset().mockResolvedValue(CURRENT_USER);
    chatConversationMarkAsSeen.mockReset().mockResolvedValue(undefined);
    chatConversationGetConversations
      .mockReset()
      .mockResolvedValue({ items: [], nextCursor: null });
    chatConversationGetConversation.mockReset();
  });

  it("fetches the conversation on its own when it's missing from the list cache", async () => {
    chatConversationGetConversation.mockResolvedValue(conversationRecord());

    renderPanel("c9");

    await waitFor(() =>
      expect(chatConversationGetConversation).toHaveBeenCalledWith("c9"),
    );
  });

  it("renders NotFound inside the pane when the fetch 404s", async () => {
    chatConversationGetConversation.mockRejectedValue(
      new HttpError({ statusCode: 404, message: "Not found" }),
    );

    renderPanel("does-not-exist");

    expect(
      await screen.findByRole("heading", { name: "404 Not Found" }),
    ).toBeInTheDocument();
  });

  it("renders NotFound inside the pane when the fetch 403s", async () => {
    chatConversationGetConversation.mockRejectedValue(
      new HttpError({ statusCode: 403, message: "Forbidden" }),
    );

    renderPanel("not-mine");

    expect(
      await screen.findByRole("heading", { name: "404 Not Found" }),
    ).toBeInTheDocument();
  });

  it("does not render NotFound for a server error", async () => {
    chatConversationGetConversation.mockRejectedValue(
      new HttpError({ statusCode: 500, message: "Server error" }),
    );

    renderPanel("c9");

    await waitFor(() =>
      expect(chatConversationGetConversation).toHaveBeenCalled(),
    );
    expect(
      screen.queryByRole("heading", { name: "404 Not Found" }),
    ).not.toBeInTheDocument();
  });
});

describe("ConversationPanel — typing", () => {
  beforeEach(() => {
    useAuthStore.setState({ token: "a-token" });
    chatUserMe.mockReset().mockResolvedValue(CURRENT_USER);
    chatConversationGetConversations
      .mockReset()
      .mockResolvedValue({ items: [], nextCursor: null });
    chatConversationGetConversation
      .mockReset()
      .mockResolvedValue(conversationRecord());
    subscribeToTyping.mockClear();
    useSocketStore.setState({ client: {} as Client, isConnected: true });
  });

  afterEach(() => {
    useSocketStore.setState({ client: null, isConnected: false });
  });

  it('shows "X is typing…" above the composer, and hides it again after 3s with no follow-up event', async () => {
    renderPanel("c9");
    await screen.findByLabelText("Message composer");

    vi.useFakeTimers();
    try {
      const onTyping = subscribeToTyping.mock.calls.at(-1)?.[2];
      act(() =>
        onTyping?.({
          eventType: ChatSocketEventType.TYPING,
          conversationId: "c9",
          userId: "u2",
        }),
      );
      expect(screen.getByText("Lan Nguyen is typing…")).toBeInTheDocument();

      act(() => vi.advanceTimersByTime(3000));
      expect(
        screen.queryByText("Lan Nguyen is typing…"),
      ).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});
