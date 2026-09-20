import type { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ChatSocketEventType } from "@monorepo/types/chat-socket";

import { useTypingIndicator } from "~/features/conversation/hooks/use-typing-indicator";
import { useSocketStore } from "~/stores/use-socket-store";

/** A fake `Client` recording one handler per destination, driven by `emit`. */
function createFakeClient() {
  const handlers = new Map<string, (message: IMessage) => void>();

  const client = {
    subscribe: vi.fn(
      (destination: string, handler: (message: IMessage) => void) => {
        handlers.set(destination, handler);
        return { unsubscribe: vi.fn() } satisfies Partial<StompSubscription>;
      },
    ),
    publish: vi.fn(),
  } as unknown as Client;

  function emit(conversationId: string, userId: string) {
    const destination = `/topic/conversations/${conversationId}/typing`;
    handlers.get(destination)?.({
      body: JSON.stringify({
        eventType: ChatSocketEventType.TYPING,
        conversationId,
        userId,
      }),
    } as IMessage);
  }

  return { client, emit };
}

describe("useTypingIndicator", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    useSocketStore.setState({ client: null, isConnected: false });
  });

  it("shows a userId once its typing event arrives", () => {
    const { client, emit } = createFakeClient();
    useSocketStore.setState({ client, isConnected: true });

    const { result } = renderHook(() => useTypingIndicator("c1", "me"));

    act(() => emit("c1", "u2"));

    expect(result.current).toEqual(["u2"]);
  });

  it("clears a userId once 3s pass with no follow-up event", () => {
    const { client, emit } = createFakeClient();
    useSocketStore.setState({ client, isConnected: true });

    const { result } = renderHook(() => useTypingIndicator("c1", "me"));

    act(() => emit("c1", "u2"));
    expect(result.current).toEqual(["u2"]);

    act(() => vi.advanceTimersByTime(2999));
    expect(result.current).toEqual(["u2"]);

    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toEqual([]);
  });

  it("resets the 3s window on a new event instead of expiring on the original one", () => {
    const { client, emit } = createFakeClient();
    useSocketStore.setState({ client, isConnected: true });

    const { result } = renderHook(() => useTypingIndicator("c1", "me"));

    act(() => emit("c1", "u2"));
    act(() => vi.advanceTimersByTime(2000));
    act(() => emit("c1", "u2")); // resets the window
    act(() => vi.advanceTimersByTime(2000));

    // 4s since the first event, but only 2s since the reset — still typing.
    expect(result.current).toEqual(["u2"]);

    act(() => vi.advanceTimersByTime(1000));
    expect(result.current).toEqual([]);
  });

  it("merges two different users typing at once", () => {
    const { client, emit } = createFakeClient();
    useSocketStore.setState({ client, isConnected: true });

    const { result } = renderHook(() => useTypingIndicator("c1", "me"));

    act(() => emit("c1", "u2"));
    act(() => emit("c1", "u3"));

    expect(result.current).toEqual(["u2", "u3"]);
  });

  it("ignores the visitor's own userId", () => {
    const { client, emit } = createFakeClient();
    useSocketStore.setState({ client, isConnected: true });

    const { result } = renderHook(() => useTypingIndicator("c1", "me"));

    act(() => emit("c1", "me"));

    expect(result.current).toEqual([]);
  });

  it("returns nothing with no client connected", () => {
    useSocketStore.setState({ client: null, isConnected: false });
    const { result } = renderHook(() => useTypingIndicator("c1", "me"));
    expect(result.current).toEqual([]);
  });

  it("does not subscribe for a Draft conversation", () => {
    const { client } = createFakeClient();
    useSocketStore.setState({ client, isConnected: true });
    renderHook(() => useTypingIndicator("draft-u2", "me"));
    expect(client.subscribe).not.toHaveBeenCalled();
  });

  it("drops everything when the conversation switches", () => {
    const { client, emit } = createFakeClient();
    useSocketStore.setState({ client, isConnected: true });

    const { result, rerender } = renderHook(
      ({ conversationId }) => useTypingIndicator(conversationId, "me"),
      { initialProps: { conversationId: "c1" } },
    );

    act(() => emit("c1", "u2"));
    expect(result.current).toEqual(["u2"]);

    rerender({ conversationId: "c2" });
    expect(result.current).toEqual([]);

    // The stale timer from c1 must not resurrect u2 after the switch.
    act(() => vi.advanceTimersByTime(3000));
    expect(result.current).toEqual([]);
  });
});
