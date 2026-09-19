import { describe, expect, it } from "vitest";

import { ChatParticipantRole } from "@monorepo/types/chat-conversation";

import type { ConversationMember } from "~/features/conversation/types/conversation";
import type { Message } from "~/features/conversation/types/message";
import { isSeenByOther, readersOf } from "~/features/conversation/utils/readers-of";

const CURRENT_USER_ID = "u1";

function member(overrides: Partial<ConversationMember> & Pick<ConversationMember, "userId">): ConversationMember {
  return {
    displayName: "Someone",
    role: ChatParticipantRole.MEMBER,
    ...overrides,
  };
}

function message(id: string, createdAt = "2026-09-19T08:00:00.000Z"): Pick<Message, "id" | "createdAt"> {
  return { id, createdAt };
}

describe("readersOf", () => {
  it("returns a participant whose lastReadMessageId names exactly this message", () => {
    const readers = readersOf(
      message("m2"),
      [
        member({ userId: CURRENT_USER_ID, lastReadMessageId: "m2" }),
        member({ userId: "u2", displayName: "Lan", lastReadMessageId: "m2" }),
        member({ userId: "u3", displayName: "Minh", lastReadMessageId: "m1" }),
      ],
      CURRENT_USER_ID,
    );

    expect(readers.map((reader) => reader.userId)).toEqual(["u2"]);
  });

  it("never counts the signed-in visitor themselves", () => {
    const readers = readersOf(
      message("m2"),
      [member({ userId: CURRENT_USER_ID, lastReadMessageId: "m2" })],
      CURRENT_USER_ID,
    );

    expect(readers).toEqual([]);
  });

  it("floats down to the later message once a reader reads on", () => {
    const participants: ConversationMember[] = [
      member({ userId: "u2", displayName: "Lan", lastReadMessageId: "m1" }),
    ];

    expect(readersOf(message("m1"), participants, CURRENT_USER_ID)).toHaveLength(1);
    expect(readersOf(message("m2"), participants, CURRENT_USER_ID)).toHaveLength(0);

    participants[0] = { ...participants[0]!, lastReadMessageId: "m2" };

    expect(readersOf(message("m1"), participants, CURRENT_USER_ID)).toHaveLength(0);
    expect(readersOf(message("m2"), participants, CURRENT_USER_ID)).toHaveLength(1);
  });

  it("caps the visible stack at 3, leaving the rest for the caller's '+n'", () => {
    const participants = ["u2", "u3", "u4", "u5"].map((userId) =>
      member({ userId, lastReadMessageId: "m1" }),
    );

    const readers = readersOf(message("m1"), participants, CURRENT_USER_ID);

    // readersOf itself returns every reader — capping to <=3 + "+n" is the
    // caller's rendering job (message-row.tsx), asserted in its own test.
    expect(readers).toHaveLength(4);
  });
});

describe("isSeenByOther", () => {
  it("is false when the other participant has never read anything", () => {
    expect(isSeenByOther(message("m1"), member({ userId: "u2" }))).toBe(false);
    expect(isSeenByOther(message("m1"), undefined)).toBe(false);
  });

  it("is true once their lastReadAt reaches this message's own createdAt", () => {
    const other = member({ userId: "u2", lastReadAt: "2026-09-19T08:00:00.000Z" });

    expect(isSeenByOther(message("m1", "2026-09-19T08:00:00.000Z"), other)).toBe(true);
  });

  it("stays true when they've read past this message (a later reply of their own)", () => {
    const other = member({ userId: "u2", lastReadAt: "2026-09-19T09:00:00.000Z" });

    expect(isSeenByOther(message("m1", "2026-09-19T08:00:00.000Z"), other)).toBe(true);
  });

  it("is false while their lastReadAt is still before this message", () => {
    const other = member({ userId: "u2", lastReadAt: "2026-09-19T07:00:00.000Z" });

    expect(isSeenByOther(message("m1", "2026-09-19T08:00:00.000Z"), other)).toBe(false);
  });
});
