import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { VirtuosoMockContext } from "react-virtuoso";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ChatConversationRecord } from "@monorepo/types/chat-conversation";
import type { ChatUserProfile } from "@monorepo/types/chat-user";
import {
  ChatConversationType,
  ChatParticipantRole,
} from "@monorepo/types/chat-conversation";

import ConversationList from "~/features/conversation/components/conversation-list";
import { conversationQueryKeys } from "~/hooks/api/conversation";
import { useAuthStore } from "~/stores/use-auth-store";

const CURRENT_USER: ChatUserProfile = {
  id: "u1",
  username: "tuanhq02",
  firstName: "Tuan",
  lastName: "Huynh",
};

const { chatUserMe, chatConversationGetConversations, chatFriendList } =
  vi.hoisted(() => ({
    chatUserMe: vi.fn(),
    chatConversationGetConversations: vi.fn(),
    chatFriendList: vi.fn(),
  }));

vi.mock("~/libs/http-client", () => ({
  chatUserService: { me: chatUserMe },
  chatConversationService: {
    getConversations: chatConversationGetConversations,
    markAsSeen: vi.fn().mockResolvedValue(undefined),
    createGroup: vi.fn(),
    updateGroup: vi.fn(),
    addMembers: vi.fn(),
    removeMember: vi.fn(),
    leave: vi.fn(),
  },
  chatFriendService: {
    list: chatFriendList,
    requests: vi.fn(),
    send: vi.fn(),
    accept: vi.fn(),
    decline: vi.fn(),
    cancel: vi.fn(),
    remove: vi.fn(),
  },
}));

vi.mock("~/stores/use-socket-store", async () => {
  const { create } = await import("zustand");
  return {
    useSocketStore: create(() => ({
      client: null,
      isConnected: false,
      onlineUsers: [] as string[],
      connect: vi.fn(),
      disconnect: vi.fn(),
    })),
  };
});

function unreadConversation(
  id: string,
  title: string,
  unreadCount: number,
): ChatConversationRecord {
  return {
    id,
    type: ChatConversationType.DIRECT,
    groupName: null,
    lastMessage: null,
    lastMessageAt: null,
    unreadCount,
    participants: [
      {
        userId: "u1",
        username: "tuanhq02",
        firstName: "Tuan",
        lastName: "Huynh",
        role: ChatParticipantRole.MEMBER,
      },
      {
        userId: `member-of-${id}`,
        username: `member-of-${id}`,
        firstName: title,
        lastName: "",
        role: ChatParticipantRole.MEMBER,
      },
    ],
  };
}

function renderList(queryClient: QueryClient) {
  return render(
    <QueryClientProvider client={queryClient}>
      <VirtuosoMockContext.Provider
        value={{ viewportHeight: 800, itemHeight: 60 }}
      >
        <MemoryRouter initialEntries={["/"]}>
          <ConversationList />
        </MemoryRouter>
      </VirtuosoMockContext.Provider>
    </QueryClientProvider>,
  );
}

describe("ConversationList", () => {
  beforeEach(() => {
    useAuthStore.setState({ token: "a-token" });
    chatUserMe.mockReset().mockResolvedValue(CURRENT_USER);
    chatConversationGetConversations.mockReset();
    chatFriendList
      .mockReset()
      .mockResolvedValue({ items: [], nextOffset: null });
  });

  it("keeps a conversation under the Unread chip until the visitor leaves it, even once it is read", async () => {
    const user = userEvent.setup();
    const queryClient = new QueryClient();
    chatConversationGetConversations.mockResolvedValue({
      items: [
        unreadConversation("c1", "Lan Nguyen", 2),
        unreadConversation("c2", "Team Alpha", 0),
      ],
      nextCursor: null,
    });

    renderList(queryClient);

    await screen.findByText("Lan Nguyen");
    await user.click(screen.getByRole("button", { name: "Unread" }));

    // "Team Alpha" (read) drops out; "Lan Nguyen" (unread) stays.
    expect(screen.getByText("Lan Nguyen")).toBeInTheDocument();
    expect(screen.queryByText("Team Alpha")).not.toBeInTheDocument();

    // The conversation gets marked seen while the visitor is still looking
    // at it (a live `conversation.seen` patches the cache this same way —
    // see applyConversationSeenToCache in ~/hooks/api/conversation.ts).
    queryClient.setQueriesData<{
      pages: { items: ChatConversationRecord[]; nextCursor: string | null }[];
      pageParams: unknown[];
    }>({ queryKey: conversationQueryKeys.list() }, (data) => {
      if (!data) return data;
      return {
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          items: page.items.map((item) =>
            item.id === "c1" ? { ...item, unreadCount: 0 } : item,
          ),
        })),
      };
    });

    // Still there — the kept set survives the drop to zero.
    expect(await screen.findByText("Lan Nguyen")).toBeInTheDocument();

    // Leaving the chip and coming back drops the kept set: now read, it's gone.
    await user.click(screen.getByRole("button", { name: "All" }));
    await user.click(screen.getByRole("button", { name: "Unread" }));

    await waitFor(() =>
      expect(screen.queryByText("Lan Nguyen")).not.toBeInTheDocument(),
    );
  });
});
