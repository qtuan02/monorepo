import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ChatMessageType } from "@monorepo/types/chat-message";

import type { Message } from "~/features/conversation/types/message";
import { useNewMessageIndicator } from "~/features/conversation/hooks/use-new-message-indicator";

function message(id: string): Message {
  return {
    id,
    conversationId: "c1",
    senderId: "u2",
    senderName: "Lan Nguyen",
    content: id,
    type: ChatMessageType.TEXT,
    createdAt: "2026-09-19T08:00:00.000Z",
    updatedAt: "2026-09-19T08:00:00.000Z",
  };
}

describe("useNewMessageIndicator", () => {
  it("stays at 0 while at the bottom, even as new messages arrive", () => {
    const { result, rerender } = renderHook(
      ({ messages, atBottom }) => useNewMessageIndicator(messages, atBottom),
      { initialProps: { messages: [message("m1")], atBottom: true } },
    );

    rerender({ messages: [message("m1"), message("m2")], atBottom: true });

    expect(result.current.count).toBe(0);
  });

  it("counts a message appended to the tail once the visitor leaves the bottom", () => {
    const { result, rerender } = renderHook(
      ({ messages, atBottom }) => useNewMessageIndicator(messages, atBottom),
      { initialProps: { messages: [message("m1")], atBottom: false } },
    );

    rerender({ messages: [message("m1"), message("m2")], atBottom: false });
    rerender({
      messages: [message("m1"), message("m2"), message("m3")],
      atBottom: false,
    });

    expect(result.current.count).toBe(2);
  });

  it("does not count an older page loaded onto the front — the tail message is unchanged", () => {
    const { result, rerender } = renderHook(
      ({ messages, atBottom }) => useNewMessageIndicator(messages, atBottom),
      { initialProps: { messages: [message("m2")], atBottom: false } },
    );

    // startReached() prepends an older page — the array grows, but m2 stays last.
    rerender({ messages: [message("m1"), message("m2")], atBottom: false });

    expect(result.current.count).toBe(0);
  });

  it("clears the moment the visitor returns to the bottom", () => {
    const { result, rerender } = renderHook(
      ({ messages, atBottom }) => useNewMessageIndicator(messages, atBottom),
      { initialProps: { messages: [message("m1")], atBottom: false } },
    );

    rerender({ messages: [message("m1"), message("m2")], atBottom: false });
    expect(result.current.count).toBe(1);

    rerender({ messages: [message("m1"), message("m2")], atBottom: true });
    expect(result.current.count).toBe(0);
  });

  it("exposes an explicit reset for the button's own click", () => {
    const { result, rerender } = renderHook(
      ({ messages, atBottom }) => useNewMessageIndicator(messages, atBottom),
      { initialProps: { messages: [message("m1")], atBottom: false } },
    );

    rerender({ messages: [message("m1"), message("m2")], atBottom: false });
    expect(result.current.count).toBe(1);

    act(() => result.current.reset());
    rerender({ messages: [message("m1"), message("m2")], atBottom: false });

    expect(result.current.count).toBe(0);
  });
});
