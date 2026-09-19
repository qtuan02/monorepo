import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ChatMessageType } from "@monorepo/types/chat-message";

import type { Message } from "~/features/conversation/types/message";
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
});
