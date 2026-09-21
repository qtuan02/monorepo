import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

// These are pure cache functions — no request is made — but the module
// still imports the service singleton at load time, which reads `env` and
// throws with no root `.env` in a fresh checkout (see ~/libs/http-client.ts).
vi.mock("~/libs/http-client", () => ({
  chatConversationService: {},
}));

import type { ChatConversationRecord } from "@monorepo/types/chat-conversation";
import type {
  ChatConversationRemovedEvent,
  ChatConversationUpdatedEvent,
} from "@monorepo/types/chat-socket";
import {
  ChatConversationType,
  ChatParticipantRole,
} from "@monorepo/types/chat-conversation";
import { ChatSocketEventType } from "@monorepo/types/chat-socket";

import {
  applyConversationRemovedToCache,
  applyConversationUpdateToCache,
  conversationQueryKeys,
} from "~/hooks/api/conversation";

function conversation(
  overrides: Partial<ChatConversationRecord> = {},
): ChatConversationRecord {
  return {
    id: "c1",
    type: ChatConversationType.DIRECT,
    groupName: null,
    lastMessage: null,
    lastMessageAt: "2026-09-19T00:00:00.000Z",
    unreadCount: 0,
    participants: [
      {
        userId: "u1",
        username: "tuanhq02",
        firstName: "Tuan",
        lastName: "Huynh",
        role: ChatParticipantRole.MEMBER,
      },
    ],
    ...overrides,
  };
}

function seedList(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  items: ChatConversationRecord[],
) {
  queryClient.setQueryData(queryKey, {
    pages: [{ items, nextCursor: null }],
    pageParams: [undefined],
  });
}

function itemsOf(queryClient: QueryClient, queryKey: readonly unknown[]) {
  return queryClient.getQueryData<{
    pages: Array<{ items: ChatConversationRecord[] }>;
  }>(queryKey)?.pages[0]?.items;
}

function updatedEvent(
  record: ChatConversationRecord,
): ChatConversationUpdatedEvent {
  return {
    eventType: ChatSocketEventType.CONVERSATION_UPDATED,
    conversation: record,
  };
}

function removedEvent(conversationId: string): ChatConversationRemovedEvent {
  return {
    eventType: ChatSocketEventType.CONVERSATION_REMOVED,
    conversationId,
  };
}

describe("applyConversationUpdateToCache", () => {
  it("replaces the record in place, keeping its position", () => {
    const queryClient = new QueryClient();
    const c1 = conversation({ id: "c1", groupName: "old" });
    const c2 = conversation({ id: "c2" });
    seedList(queryClient, conversationQueryKeys.lists(), [c1, c2]);

    applyConversationUpdateToCache(
      queryClient,
      updatedEvent({ ...c1, groupName: "new" }),
    );

    const items = itemsOf(queryClient, conversationQueryKeys.lists());
    expect(items?.map((item) => item.id)).toEqual(["c1", "c2"]);
    expect(items?.[0]?.groupName).toBe("new");
  });

  it("inserts a brand-new conversation onto the first page", () => {
    const queryClient = new QueryClient();
    const c1 = conversation({ id: "c1" });
    seedList(queryClient, conversationQueryKeys.lists(), [c1]);

    const c3 = conversation({ id: "c3" });
    applyConversationUpdateToCache(queryClient, updatedEvent(c3));

    const items = itemsOf(queryClient, conversationQueryKeys.lists());
    expect(items?.map((item) => item.id)).toEqual(["c3", "c1"]);
  });

  it("overrides the event's own unreadCount when told to", () => {
    const queryClient = new QueryClient();
    seedList(queryClient, conversationQueryKeys.lists(), []);

    applyConversationUpdateToCache(
      queryClient,
      updatedEvent(conversation({ id: "c1", unreadCount: 5 })),
      { unreadCount: 0 },
    );

    const items = itemsOf(queryClient, conversationQueryKeys.lists());
    expect(items?.[0]?.unreadCount).toBe(0);
  });

  it("keeps the event's own unreadCount when no override is given", () => {
    const queryClient = new QueryClient();
    seedList(queryClient, conversationQueryKeys.lists(), []);

    applyConversationUpdateToCache(
      queryClient,
      updatedEvent(conversation({ id: "c1", unreadCount: 5 })),
    );

    const items = itemsOf(queryClient, conversationQueryKeys.lists());
    expect(items?.[0]?.unreadCount).toBe(5);
  });

  it("never inserts a DIRECT conversation into the type-filtered Groups list", () => {
    const queryClient = new QueryClient();
    seedList(queryClient, conversationQueryKeys.lists(), []);
    seedList(
      queryClient,
      conversationQueryKeys.list({ type: ChatConversationType.GROUP }),
      [],
    );

    applyConversationUpdateToCache(
      queryClient,
      updatedEvent(
        conversation({ id: "c1", type: ChatConversationType.DIRECT }),
      ),
    );

    expect(itemsOf(queryClient, conversationQueryKeys.lists())).toHaveLength(1);
    expect(
      itemsOf(
        queryClient,
        conversationQueryKeys.list({ type: ChatConversationType.GROUP }),
      ),
    ).toHaveLength(0);
  });

  it("does insert a GROUP conversation into the type-filtered Groups list", () => {
    const queryClient = new QueryClient();
    seedList(queryClient, conversationQueryKeys.lists(), []);
    seedList(
      queryClient,
      conversationQueryKeys.list({ type: ChatConversationType.GROUP }),
      [],
    );

    applyConversationUpdateToCache(
      queryClient,
      updatedEvent(
        conversation({ id: "c1", type: ChatConversationType.GROUP }),
      ),
    );

    expect(
      itemsOf(
        queryClient,
        conversationQueryKeys.list({ type: ChatConversationType.GROUP }),
      ),
    ).toHaveLength(1);
  });

  it("is a no-op when the list has never been fetched", () => {
    const queryClient = new QueryClient();

    expect(() =>
      applyConversationUpdateToCache(
        queryClient,
        updatedEvent(conversation({ id: "c1" })),
      ),
    ).not.toThrow();
    expect(itemsOf(queryClient, conversationQueryKeys.lists())).toBeUndefined();
  });
});

describe("applyConversationRemovedToCache", () => {
  it("removes the record from the cached list", () => {
    const queryClient = new QueryClient();
    const c1 = conversation({ id: "c1" });
    const c2 = conversation({ id: "c2" });
    seedList(queryClient, conversationQueryKeys.lists(), [c1, c2]);

    applyConversationRemovedToCache(queryClient, removedEvent("c1"));

    const items = itemsOf(queryClient, conversationQueryKeys.lists());
    expect(items?.map((item) => item.id)).toEqual(["c2"]);
  });

  it("is a no-op when the conversation was never in the cache", () => {
    const queryClient = new QueryClient();
    seedList(queryClient, conversationQueryKeys.lists(), [
      conversation({ id: "c2" }),
    ]);

    applyConversationRemovedToCache(queryClient, removedEvent("c1"));

    expect(itemsOf(queryClient, conversationQueryKeys.lists())).toHaveLength(1);
  });
});
