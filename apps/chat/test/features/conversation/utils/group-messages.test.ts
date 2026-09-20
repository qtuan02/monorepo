import { describe, expect, it } from "vitest";

import { ChatMessageType } from "@monorepo/types/chat-message";

import type { Message } from "~/features/conversation/types/message";
import { groupMessages } from "~/features/conversation/utils/group-messages";

const CURRENT_USER_ID = "u1";

function message(overrides: Partial<Message> & Pick<Message, "id">): Message {
  return {
    conversationId: "c1",
    senderId: "u2",
    senderName: "Lan Nguyen",
    content: "hi",
    attachmentUrl: null,
    type: ChatMessageType.TEXT,
    createdAt: "2026-09-16T08:00:00.000Z",
    updatedAt: "2026-09-16T08:00:00.000Z",
    ...overrides,
  };
}

describe("groupMessages", () => {
  it("joins three consecutive messages from one sender under 5 minutes apart into one group", () => {
    const messages = [
      message({ id: "m1", createdAt: "2026-09-16T08:00:00.000Z" }),
      message({ id: "m2", createdAt: "2026-09-16T08:02:00.000Z" }),
      message({ id: "m3", createdAt: "2026-09-16T08:04:00.000Z" }),
    ];

    const positions = groupMessages(messages, CURRENT_USER_ID);

    expect(positions.map((p) => [p.isFirstInGroup, p.isLastInGroup])).toEqual([
      [true, false],
      [false, false],
      [false, true],
    ]);
  });

  it("breaks the group at exactly 5 minutes apart — the threshold is strict", () => {
    const messages = [
      message({ id: "m1", createdAt: "2026-09-16T08:00:00.000Z" }),
      message({ id: "m2", createdAt: "2026-09-16T08:05:00.000Z" }),
    ];

    const positions = groupMessages(messages, CURRENT_USER_ID);

    expect(positions[0]?.isLastInGroup).toBe(true);
    expect(positions[1]?.isFirstInGroup).toBe(true);
  });

  it("starts a new group when the sender changes, even seconds apart", () => {
    const messages = [
      message({
        id: "m1",
        senderId: "u2",
        createdAt: "2026-09-16T08:00:00.000Z",
      }),
      message({
        id: "m2",
        senderId: "u1",
        createdAt: "2026-09-16T08:00:30.000Z",
      }),
    ];

    const positions = groupMessages(messages, CURRENT_USER_ID);

    expect(positions[0]?.isLastInGroup).toBe(true);
    expect(positions[1]?.isFirstInGroup).toBe(true);
    expect(positions[1]?.isOwn).toBe(true);
  });

  it("starts a new group across a day boundary, even under the 5-minute gap", () => {
    const messages = [
      message({ id: "m1", createdAt: "2026-09-16T23:59:00.000Z" }),
      message({ id: "m2", createdAt: "2026-09-17T00:01:00.000Z" }),
    ];

    const positions = groupMessages(messages, CURRENT_USER_ID);

    expect(positions[0]?.isLastInGroup).toBe(true);
    expect(positions[1]?.isFirstInGroup).toBe(true);
    expect(positions[1]?.showDateDivider).toBe(true);
  });

  it("keeps a SYSTEM message out of every group, on both sides", () => {
    const messages = [
      message({ id: "m1", createdAt: "2026-09-16T08:00:00.000Z" }),
      message({
        id: "m2",
        type: ChatMessageType.SYSTEM,
        senderId: "u2",
        createdAt: "2026-09-16T08:01:00.000Z",
      }),
      message({ id: "m3", createdAt: "2026-09-16T08:02:00.000Z" }),
    ];

    const positions = groupMessages(messages, CURRENT_USER_ID);

    expect(positions[0]?.isLastInGroup).toBe(true);
    expect(positions[1]).toMatchObject({
      isSystem: true,
      isFirstInGroup: true,
      isLastInGroup: true,
    });
    expect(positions[2]?.isFirstInGroup).toBe(true);
  });

  it("shows a date divider only when the day changes from the previous message", () => {
    const messages = [
      message({ id: "m1", createdAt: "2026-09-16T08:00:00.000Z" }),
      message({ id: "m2", createdAt: "2026-09-16T08:01:00.000Z" }),
    ];

    const positions = groupMessages(messages, CURRENT_USER_ID);

    expect(positions[0]?.showDateDivider).toBe(true);
    expect(positions[1]?.showDateDivider).toBe(false);
  });
});
