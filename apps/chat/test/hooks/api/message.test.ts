import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

// These are pure cache functions — no request is made — but the module
// still imports the service singletons at load time, which read `env` and
// throw with no root `.env` in a fresh checkout (see ~/libs/http-client.ts).
vi.mock("~/libs/http-client", () => ({
  chatMessageService: {},
  chatConversationService: {},
}));

import type { ChatMessageRecord } from "@monorepo/types/chat-message";
import { ChatMessageType } from "@monorepo/types/chat-message";

import {
  appendConversationMessageToCache,
  messageQueryKeys,
  removeConversationMessageFromCache,
} from "~/hooks/api/message";

function message(
  overrides: Partial<ChatMessageRecord> = {},
): ChatMessageRecord {
  return {
    id: "m1",
    conversationId: "c1",
    senderId: "u1",
    content: "hi",
    type: ChatMessageType.TEXT,
    createdAt: "2026-09-19T00:00:00.000Z",
    updatedAt: "2026-09-19T00:00:00.000Z",
    ...overrides,
  };
}

function seedMessages(
  queryClient: QueryClient,
  conversationId: string,
  items: ChatMessageRecord[],
) {
  queryClient.setQueryData(messageQueryKeys.byConversation(conversationId), {
    pages: [{ items, nextCursor: null }],
    pageParams: [undefined],
  });
}

function itemsOf(queryClient: QueryClient, conversationId: string) {
  return queryClient.getQueryData<{
    pages: Array<{ items: ChatMessageRecord[] }>;
  }>(messageQueryKeys.byConversation(conversationId))?.pages[0]?.items;
}

describe("appendConversationMessageToCache", () => {
  it("appends a brand-new message onto the end of the newest page", () => {
    const queryClient = new QueryClient();
    seedMessages(queryClient, "c1", [message({ id: "m1" })]);

    appendConversationMessageToCache(queryClient, message({ id: "m2" }));

    expect(itemsOf(queryClient, "c1")?.map((item) => item.id)).toEqual([
      "m1",
      "m2",
    ]);
  });

  it("upserts by id — replaces the message where it already sits instead of duplicating it", () => {
    const queryClient = new QueryClient();
    seedMessages(queryClient, "c1", [
      message({ id: "m1", content: "first" }),
      message({ id: "m2", content: "second" }),
    ]);

    appendConversationMessageToCache(
      queryClient,
      message({ id: "m1", content: "edited" }),
    );

    const items = itemsOf(queryClient, "c1");
    expect(items).toHaveLength(2);
    expect(items?.map((item) => item.id)).toEqual(["m1", "m2"]);
    expect(items?.[0]?.content).toBe("edited");
  });

  it("is a no-op when the conversation's messages were never fetched", () => {
    const queryClient = new QueryClient();

    expect(() =>
      appendConversationMessageToCache(queryClient, message({ id: "m1" })),
    ).not.toThrow();
    expect(itemsOf(queryClient, "c1")).toBeUndefined();
  });
});

describe("removeConversationMessageFromCache", () => {
  it("removes the message by id, leaving the rest untouched", () => {
    const queryClient = new QueryClient();
    seedMessages(queryClient, "c1", [
      message({ id: "m2" }),
      message({ id: "m1" }),
    ]);

    removeConversationMessageFromCache(queryClient, message({ id: "m1" }));

    expect(itemsOf(queryClient, "c1")?.map((item) => item.id)).toEqual(["m2"]);
  });

  it("is a no-op when the message was never in the cache", () => {
    const queryClient = new QueryClient();
    seedMessages(queryClient, "c1", [message({ id: "m2" })]);

    removeConversationMessageFromCache(queryClient, message({ id: "m1" }));

    expect(itemsOf(queryClient, "c1")).toHaveLength(1);
  });
});
