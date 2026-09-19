import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ChatConversationRecord } from "@monorepo/types/chat-conversation";
import type { ChatUserProfile } from "@monorepo/types/chat-user";
import {
  ChatConversationType,
  ChatParticipantRole,
} from "@monorepo/types/chat-conversation";

import { useConversationList } from "~/features/conversation/hooks/use-conversation-list";
import { useAuthStore } from "~/stores/use-auth-store";

const CURRENT_USER: ChatUserProfile = {
  id: "u1",
  username: "tuanhq02",
  firstName: "Tuan",
  lastName: "Huynh",
};

const { chatUserMe, chatConversationGetConversations } = vi.hoisted(() => ({
  chatUserMe: vi.fn(),
  chatConversationGetConversations: vi.fn(),
}));

vi.mock("~/libs/http-client", () => ({
  chatUserService: { me: chatUserMe },
  chatConversationService: {
    getConversations: chatConversationGetConversations,
  },
}));

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

function directConversation(
  id: string,
  lastMessageAt: string | null,
): ChatConversationRecord {
  return {
    id,
    type: ChatConversationType.DIRECT,
    groupName: null,
    lastMessage: null,
    lastMessageAt,
    unreadCount: 0,
    participants: [
      {
        userId: "u1",
        firstName: "Tuan",
        lastName: "Huynh",
        role: ChatParticipantRole.MEMBER,
      },
      {
        userId: `member-of-${id}`,
        firstName: id,
        lastName: "",
        role: ChatParticipantRole.MEMBER,
      },
    ],
  };
}

describe("useConversationList", () => {
  beforeEach(() => {
    useAuthStore.setState({ token: "a-token" });
    chatUserMe.mockReset().mockResolvedValue(CURRENT_USER);
    chatConversationGetConversations.mockReset();
  });

  it("sorts by most recent activity first, with no-activity conversations last", async () => {
    chatConversationGetConversations.mockResolvedValue({
      items: [
        directConversation("older", "2026-09-15T00:00:00.000Z"),
        directConversation("no-activity", null),
        directConversation("newest", "2026-09-17T00:00:00.000Z"),
        directConversation("middle", "2026-09-16T00:00:00.000Z"),
      ],
      nextCursor: null,
    });

    const { result } = renderHook(() => useConversationList(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.conversations.map((c) => c.id)).toEqual([
      "newest",
      "middle",
      "older",
      "no-activity",
    ]);
  });

  it("keys the Groups chip's query separately from the default list", async () => {
    const queryClient = new QueryClient();
    function sharedWrapper({ children }: { children: ReactNode }) {
      return (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );
    }

    chatConversationGetConversations.mockResolvedValue({
      items: [directConversation("c1", null)],
      nextCursor: null,
    });

    const all = renderHook(() => useConversationList("all"), {
      wrapper: sharedWrapper,
    });
    await waitFor(() => expect(all.result.current.isLoading).toBe(false));

    const groups = renderHook(() => useConversationList("groups"), {
      wrapper: sharedWrapper,
    });
    await waitFor(() => expect(groups.result.current.isLoading).toBe(false));

    // Two distinct cache entries prove the keys never collided — a shared
    // key would leave only one "conversation" > "list" entry behind.
    const conversationListEntries = queryClient
      .getQueryCache()
      .findAll({ queryKey: ["conversation", "list"] });
    expect(conversationListEntries).toHaveLength(2);

    expect(chatConversationGetConversations).toHaveBeenCalledWith(
      expect.objectContaining({ type: undefined }),
    );
    expect(chatConversationGetConversations).toHaveBeenCalledWith(
      expect.objectContaining({ type: "GROUP" }),
    );
  });
});
