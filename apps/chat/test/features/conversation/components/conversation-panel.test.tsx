import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ChatConversationRecord } from "@monorepo/types/chat-conversation";
import type { ChatUserProfile } from "@monorepo/types/chat-user";
import { HttpError } from "@monorepo/api/client";
import {
  ChatConversationType,
  ChatParticipantRole,
} from "@monorepo/types/chat-conversation";

import ConversationPanel from "~/features/conversation/components/conversation-panel";

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
} = vi.hoisted(() => ({
  chatUserMe: vi.fn(),
  chatConversationGetConversations: vi.fn(),
  chatConversationGetConversation: vi.fn(),
}));

vi.mock("~/libs/http-client", () => ({
  chatUserService: { me: chatUserMe },
  chatConversationService: {
    getConversations: chatConversationGetConversations,
    getConversation: chatConversationGetConversation,
    markAsSeen: vi.fn().mockResolvedValue(undefined),
  },
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

describe("ConversationPanel — deep-link fallback", () => {
  beforeEach(() => {
    chatUserMe.mockReset().mockResolvedValue(CURRENT_USER);
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
