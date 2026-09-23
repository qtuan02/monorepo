import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ChatUserProfile } from "@monorepo/types/chat-user";
import {
  ChatConversationType,
  ChatParticipantRole,
} from "@monorepo/types/chat-conversation";
import { ChatMessageType } from "@monorepo/types/chat-message";

import { useConversationMessages } from "~/features/conversation/hooks/use-conversation-messages";
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

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

// Two pages: the newest-fetched page first (as the API returns it — the
// cursor walks backward in time page-to-page, but each page's own items
// arrive oldest-first — see ConversationServiceImpl.getMessages), then an
// older page fetched by a second `fetchNextPage()` call.
const NEWEST_PAGE = {
  items: [
    {
      id: "m2",
      conversationId: "c1",
      senderId: "u1",
      content: "Sounds good",
      type: ChatMessageType.TEXT,
      createdAt: "2026-09-16T09:00:00.000Z",
      updatedAt: "2026-09-16T09:00:00.000Z",
    },
    {
      id: "m3",
      conversationId: "c1",
      senderId: "u2",
      content: "See you then",
      type: ChatMessageType.TEXT,
      createdAt: "2026-09-16T10:00:00.000Z",
      updatedAt: "2026-09-16T10:00:00.000Z",
    },
  ],
  nextCursor: "cursor-1",
};

const OLDER_PAGE = {
  items: [
    {
      id: "m1",
      conversationId: "c1",
      senderId: "u2",
      content: "Hey, are we still on for tomorrow?",
      type: ChatMessageType.TEXT,
      createdAt: "2026-09-16T08:00:00.000Z",
      updatedAt: "2026-09-16T08:00:00.000Z",
    },
  ],
  nextCursor: null,
};

describe("useConversationMessages", () => {
  beforeEach(() => {
    useAuthStore.setState({ token: "a-token" });
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
    chatMessageGetMessages.mockReset();
  });

  it("orders one page's messages oldest-to-newest and resolves each sender's name", async () => {
    chatMessageGetMessages.mockResolvedValue(NEWEST_PAGE);

    const { result } = renderHook(() => useConversationMessages("c1"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.messages.map((m) => m.id)).toEqual(["m2", "m3"]);
    expect(result.current.messages[0]?.senderName).toBe("Tuan Huynh");
    expect(result.current.messages[1]?.senderName).toBe("Lan Nguyen");
  });

  // Regression for the reported bug: history read on a fresh load (this
  // hook's own `select`) and a live send (`appendConversationMessageToCache`)
  // must agree on the same oldest-to-newest order — the newest message
  // always last, never flipped after a reload.
  it("keeps a live-sent message last, after the same order a fresh load produces", async () => {
    const queryClient = new QueryClient();
    function ownWrapper({ children }: { children: ReactNode }) {
      return (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );
    }
    chatMessageGetMessages.mockResolvedValue(NEWEST_PAGE);

    const { result } = renderHook(() => useConversationMessages("c1"), {
      wrapper: ownWrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.messages.map((m) => m.id)).toEqual(["m2", "m3"]);

    appendConversationMessageToCache(queryClient, {
      id: "m4",
      conversationId: "c1",
      senderId: "u1",
      content: "One more thing",
      type: ChatMessageType.TEXT,
      createdAt: "2026-09-16T11:00:00.000Z",
      updatedAt: "2026-09-16T11:00:00.000Z",
    });

    await waitFor(() =>
      expect(result.current.messages.map((m) => m.id)).toEqual([
        "m2",
        "m3",
        "m4",
      ]),
    );
  });

  it("prepends an older page in front, without reshuffling what was already loaded", async () => {
    chatMessageGetMessages.mockResolvedValueOnce(NEWEST_PAGE);

    const { result } = renderHook(() => useConversationMessages("c1"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const firstItemIndexBeforeLoadingMore = result.current.firstItemIndex;

    chatMessageGetMessages.mockResolvedValueOnce(OLDER_PAGE);
    result.current.fetchNextPage();

    await waitFor(() =>
      expect(result.current.messages.map((m) => m.id)).toEqual([
        "m1",
        "m2",
        "m3",
      ]),
    );
    // The already-loaded pair keeps its relative order — only the front grew.
    expect(
      result.current.firstItemIndex < firstItemIndexBeforeLoadingMore,
    ).toBe(true);
  });

  it("calls the service with the conversation id and a cursor from the previous page", async () => {
    chatMessageGetMessages.mockResolvedValueOnce(NEWEST_PAGE);

    const { result } = renderHook(() => useConversationMessages("c1"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    chatMessageGetMessages.mockResolvedValueOnce(OLDER_PAGE);
    result.current.fetchNextPage();

    await waitFor(() =>
      expect(chatMessageGetMessages).toHaveBeenLastCalledWith(
        "c1",
        expect.objectContaining({ cursor: "cursor-1" }),
      ),
    );
  });
});
