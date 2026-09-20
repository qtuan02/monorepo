import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ChatParticipantRole } from "@monorepo/types/chat-conversation";
import { ChatMessageType } from "@monorepo/types/chat-message";

import type { ConversationMember } from "~/features/conversation/types/conversation";
import type { Message } from "~/features/conversation/types/message";
import type { MessagePosition } from "~/features/conversation/utils/group-messages";
import MessageRow from "~/features/conversation/components/message-row";
import { groupMessages } from "~/features/conversation/utils/group-messages";

const CURRENT_USER_ID = "u1";

function message(overrides: Partial<Message> & Pick<Message, "id">): Message {
  return {
    conversationId: "c1",
    senderId: "u2",
    senderName: "Lan Nguyen",
    content: "hi",
    type: ChatMessageType.TEXT,
    createdAt: "2026-09-16T08:00:00.000Z",
    ...overrides,
  };
}

function reader(
  overrides: Partial<ConversationMember> & Pick<ConversationMember, "userId">,
): ConversationMember {
  return {
    displayName: "Someone",
    role: ChatParticipantRole.MEMBER,
    ...overrides,
  };
}

function renderThread(messages: Message[]) {
  const positions = groupMessages(messages, CURRENT_USER_ID);
  render(
    <div data-testid="thread">
      {positions.map((position) => (
        <MessageRow key={position.message.id} position={position} />
      ))}
    </div>,
  );
  return within(screen.getByTestId("thread"));
}

function renderPosition(
  position: MessagePosition,
  props: Partial<
    Pick<Parameters<typeof MessageRow>[0], "readers" | "seenByOther">
  > = {},
) {
  render(
    <div data-testid="row">
      <MessageRow position={position} {...props} />
    </div>,
  );
  return within(screen.getByTestId("row"));
}

describe("MessageRow", () => {
  it("renders the sender's name once and the time once, on a three-message run", () => {
    const thread = renderThread([
      message({
        id: "m1",
        content: "one",
        createdAt: "2026-09-16T08:00:00.000Z",
      }),
      message({
        id: "m2",
        content: "two",
        createdAt: "2026-09-16T08:02:00.000Z",
      }),
      message({
        id: "m3",
        content: "three",
        createdAt: "2026-09-16T08:04:00.000Z",
      }),
    ]);

    expect(thread.getAllByText("Lan Nguyen")).toHaveLength(1);
    expect(thread.getByText("one")).toBeInTheDocument();
    expect(thread.getByText("two")).toBeInTheDocument();
    expect(thread.getByText("three")).toBeInTheDocument();
    // The time renders once, on the last message of the run.
    expect(thread.getAllByText("08:04")).toHaveLength(1);
    expect(thread.queryByText("08:00")).not.toBeInTheDocument();
    expect(thread.queryByText("08:02")).not.toBeInTheDocument();
  });

  it("renders no avatar or sender name for the signed-in visitor's own messages", () => {
    const thread = renderThread([
      message({
        id: "m1",
        senderId: CURRENT_USER_ID,
        senderName: "Tuan Huynh",
      }),
    ]);

    expect(thread.queryByText("Tuan Huynh")).not.toBeInTheDocument();
  });

  it("renders a SYSTEM message as a standalone pill, not a bubble, and keeps it out of the neighboring group", () => {
    const thread = renderThread([
      message({ id: "m1", content: "Hey there" }),
      message({
        id: "m2",
        type: ChatMessageType.SYSTEM,
        senderId: "u3",
        content: "Minh joined the group",
        createdAt: "2026-09-16T08:01:00.000Z",
      }),
      message({
        id: "m3",
        content: "Welcome!",
        createdAt: "2026-09-16T08:02:00.000Z",
      }),
    ]);

    expect(thread.getByText("Minh joined the group")).toBeInTheDocument();
    // A SYSTEM entry starts and ends its own run: the sender name renders
    // again right after it, proving the bubble run before it did not swallow it.
    expect(thread.getAllByText("Lan Nguyen")).toHaveLength(2);
  });

  describe("read receipt", () => {
    function ownLastMessagePosition(): MessagePosition {
      const [position] = groupMessages(
        [message({ id: "m1", senderId: CURRENT_USER_ID })],
        CURRENT_USER_ID,
      );
      if (!position) throw new Error("expected one grouped message");
      return position;
    }

    it("shows 'Seen' on the visitor's own last message once the other has read it", () => {
      const row = renderPosition(ownLastMessagePosition(), {
        seenByOther: true,
      });

      expect(row.getByRole("img", { name: "Seen" })).toBeInTheDocument();
    });

    it("shows no 'Seen' text while the other hasn't read it yet", () => {
      const row = renderPosition(ownLastMessagePosition(), {
        seenByOther: false,
      });

      expect(row.queryByRole("img", { name: "Seen" })).not.toBeInTheDocument();
    });

    it("renders a reader's avatar under the message their read receipt names", () => {
      const row = renderPosition(ownLastMessagePosition(), {
        readers: [reader({ userId: "u2", displayName: "Lan Nguyen" })],
      });

      expect(row.getByText("LN")).toBeInTheDocument();
    });

    it("renders no reader avatars when nobody's frontier is this message", () => {
      const row = renderPosition(ownLastMessagePosition(), { readers: [] });

      expect(row.queryByText("LN")).not.toBeInTheDocument();
    });

    it("caps the visible stack at 3 avatars and folds the rest into '+n'", () => {
      const readers = [
        reader({ userId: "u2", displayName: "Lan Nguyen" }),
        reader({ userId: "u3", displayName: "Minh Tran" }),
        reader({ userId: "u4", displayName: "An Le" }),
        reader({ userId: "u5", displayName: "Bao Vo" }),
      ];
      const row = renderPosition(ownLastMessagePosition(), { readers });

      expect(row.getByText("LN")).toBeInTheDocument();
      expect(row.getByText("MT")).toBeInTheDocument();
      expect(row.getByText("AL")).toBeInTheDocument();
      expect(row.queryByText("BV")).not.toBeInTheDocument();
      expect(row.getByText("+1")).toBeInTheDocument();
    });
  });
});
