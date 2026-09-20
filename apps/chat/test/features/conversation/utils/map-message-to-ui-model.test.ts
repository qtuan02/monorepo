import { describe, expect, it } from "vitest";

import type { ChatMessageRecord } from "@monorepo/types/chat-message";
import { ChatMessageType } from "@monorepo/types/chat-message";

import { mapMessageToUiModel } from "~/features/conversation/utils/map-message-to-ui-model";

const RECORD: ChatMessageRecord = {
  id: "m1",
  conversationId: "c1",
  senderId: "u2",
  content: "Hello there",
  type: ChatMessageType.TEXT,
  createdAt: "2026-09-16T08:00:00.000Z",
  updatedAt: "2026-09-16T08:00:00.000Z",
};

describe("mapMessageToUiModel", () => {
  it("resolves the sender's name from the lookup map", () => {
    const message = mapMessageToUiModel(
      RECORD,
      new Map([["u2", "Lan Nguyen"]]),
    );

    expect(message.senderName).toBe("Lan Nguyen");
    expect(message.id).toBe("m1");
    expect(message.conversationId).toBe("c1");
    expect(message.senderId).toBe("u2");
    expect(message.content).toBe("Hello there");
    expect(message.createdAt).toBe("2026-09-16T08:00:00.000Z");
    expect(message.updatedAt).toBe("2026-09-16T08:00:00.000Z");
  });

  it("falls back to a generic name when the sender is not in the map", () => {
    const message = mapMessageToUiModel(RECORD, new Map());

    expect(message.senderName).toBe("Unknown user");
  });
});
