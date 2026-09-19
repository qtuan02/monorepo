import { describe, expect, it } from "vitest";

import type { Conversation } from "~/features/conversation/types/conversation";
import { filterConversations } from "~/features/conversation/utils/filter-conversations";

function conversation(overrides: Partial<Conversation>): Conversation {
  return {
    id: "c1",
    type: "DIRECT" as Conversation["type"],
    title: "Lan Nguyen",
    lastMessage: "See you tomorrow",
    lastMessageAt: null,
    unreadCount: 0,
    members: [],
    currentUserId: "u1",
    ...overrides,
  };
}

describe("filterConversations", () => {
  it("matches by title, case-insensitively", () => {
    const conversations = [
      conversation({ id: "c1", title: "Lan Nguyen" }),
      conversation({ id: "c2", title: "Team Alpha" }),
    ];

    const result = filterConversations(conversations, {
      search: "lan",
      filter: "all",
      keptUnreadIds: new Set(),
    });

    expect(result.map((c) => c.id)).toEqual(["c1"]);
  });

  it("keeps every conversation when the search term is blank", () => {
    const conversations = [
      conversation({ id: "c1" }),
      conversation({ id: "c2" }),
    ];

    const result = filterConversations(conversations, {
      search: "   ",
      filter: "all",
      keptUnreadIds: new Set(),
    });

    expect(result).toHaveLength(2);
  });

  it("under the unread chip, keeps only unread conversations plus the kept set", () => {
    const conversations = [
      conversation({ id: "c1", unreadCount: 2 }),
      conversation({ id: "c2", unreadCount: 0 }),
      conversation({ id: "c3", unreadCount: 0 }),
    ];

    const result = filterConversations(conversations, {
      search: "",
      filter: "unread",
      keptUnreadIds: new Set(["c3"]),
    });

    expect(result.map((c) => c.id)).toEqual(["c1", "c3"]);
  });

  it("applies the search term inside the unread chip", () => {
    const conversations = [
      conversation({ id: "c1", title: "Lan Nguyen", unreadCount: 1 }),
      conversation({ id: "c2", title: "Team Alpha", unreadCount: 1 }),
    ];

    const result = filterConversations(conversations, {
      search: "team",
      filter: "unread",
      keptUnreadIds: new Set(),
    });

    expect(result.map((c) => c.id)).toEqual(["c2"]);
  });

  it("leaves the groups chip's own query result untouched aside from the search term", () => {
    const conversations = [conversation({ id: "g1", title: "Team Alpha" })];

    const result = filterConversations(conversations, {
      search: "",
      filter: "groups",
      keptUnreadIds: new Set(),
    });

    expect(result).toEqual(conversations);
  });
});
