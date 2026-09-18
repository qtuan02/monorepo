import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { VirtuosoMockContext } from "react-virtuoso";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ChatUserProfile } from "@monorepo/types/chat-user";
import {
  ChatConversationType,
  ChatParticipantRole,
} from "@monorepo/types/chat-conversation";
import { ChatMessageType } from "@monorepo/types/chat-message";

import { ROUTES } from "~/constants/routes";
import { AppRoutes } from "~/pages/main";
import { useAuthStore } from "~/stores/use-auth-store";

// The seam of the Session ticket (#198): the route tree mounted at a path,
// with the service singleton mocked, asserting the Health gate + the async
// guard's own decisions. A page that fails to import, a guard that stopped
// awaiting the session check, or a health check that stopped gating, all
// fail on this table rather than a hand-fed prop.

// The real store, driven through its own API — mocking the module would
// throw away the selector behaviour the guards depend on.
const initialAuthState = useAuthStore.getState();

const CURRENT_USER: ChatUserProfile = {
  id: "u1",
  username: "tuanhq02",
  firstName: "Tuan",
  lastName: "Huynh",
};

const {
  chatHealthCheck,
  chatAuthRefresh,
  chatAuthSignIn,
  chatAuthSignUp,
  chatUserMe,
  chatConversationGetConversations,
  chatMessageGetMessages,
} = vi.hoisted(() => ({
  chatHealthCheck: vi.fn(),
  chatAuthRefresh: vi.fn(),
  chatAuthSignIn: vi.fn(),
  chatAuthSignUp: vi.fn(),
  chatUserMe: vi.fn(),
  chatConversationGetConversations: vi.fn(),
  chatMessageGetMessages: vi.fn(),
}));

vi.mock("~/libs/http-client", () => ({
  chatHealthService: { check: chatHealthCheck },
  chatAuthService: {
    refresh: chatAuthRefresh,
    signIn: chatAuthSignIn,
    signUp: chatAuthSignUp,
    signOut: vi.fn().mockResolvedValue(undefined),
  },
  chatUserService: { me: chatUserMe },
  chatConversationService: {
    getConversations: chatConversationGetConversations,
    markAsSeen: vi.fn().mockResolvedValue(undefined),
  },
  chatMessageService: { getMessages: chatMessageGetMessages },
}));

// A real zustand store backed by a static, disconnected snapshot — not a
// live socket. #201's own seam (chat-socket-provider.test.tsx) covers what
// the socket does once connected; this table only has to prove a route
// still renders when it isn't (socket is not a render condition).
vi.mock("~/stores/use-socket-store", async () => {
  const { create } = await import("zustand");
  return {
    useSocketStore: create(() => ({
      client: null,
      isConnected: false,
      onlineUsers: [] as string[],
      connect: vi.fn(),
      disconnect: vi.fn(),
    })),
  };
});

/**
 * A data router with one splat route around `<AppRoutes />`, rather than a
 * `MemoryRouter`: only a data router exposes `state.historyAction`, which is
 * what proves a guard bounced with `replace` and not `push`. Wrapped in
 * Virtuoso's own test context (virtuoso.dev/testing) so the conversation and
 * message lists render deterministically with no ResizeObserver-driven
 * measurement to wait on.
 */
function renderAt(path: string) {
  const router = createMemoryRouter([{ path: "*", element: <AppRoutes /> }], {
    initialEntries: [path],
  });
  render(
    <QueryClientProvider client={new QueryClient()}>
      <VirtuosoMockContext.Provider
        value={{ viewportHeight: 800, itemHeight: 60 }}
      >
        <RouterProvider router={router} />
      </VirtuosoMockContext.Provider>
    </QueryClientProvider>,
  );
  return router;
}

describe("the route tree", () => {
  beforeEach(() => {
    // `true` replaces rather than merges, so a token set by one test cannot
    // survive into the next.
    useAuthStore.setState(initialAuthState, true);
    chatHealthCheck.mockReset();
    chatAuthRefresh.mockReset();
    chatUserMe.mockReset().mockResolvedValue(CURRENT_USER);
    chatConversationGetConversations
      .mockReset()
      .mockResolvedValue({ items: [], nextCursor: null });
    chatMessageGetMessages
      .mockReset()
      .mockResolvedValue({ items: [], nextCursor: null });
  });

  it("blocks on the Health gate until the health check resolves", async () => {
    let resolveHealth: (() => void) | undefined;
    chatHealthCheck.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveHealth = resolve;
      }),
    );
    chatAuthRefresh.mockRejectedValue(new Error("no session"));

    renderAt(ROUTES.SIGN_IN);

    expect(screen.getByText("Connecting to server...")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Welcome back" }),
    ).not.toBeInTheDocument();

    resolveHealth?.();

    expect(
      await screen.findByRole("heading", { name: "Welcome back" }),
    ).toBeInTheDocument();
  });

  describe("once the backend answers healthy", () => {
    beforeEach(() => {
      chatHealthCheck.mockResolvedValue(undefined);
    });

    it("bounces / to sign-in with replace when there is no token and the refresh fails", async () => {
      chatAuthRefresh.mockRejectedValue(new Error("no session"));

      const router = renderAt(ROUTES.HOME);

      expect(
        await screen.findByRole("heading", { name: "Welcome back" }),
      ).toBeInTheDocument();
      expect(router.state.location.pathname).toBe(ROUTES.SIGN_IN);
      // `replace`, so Back cannot walk into the route just bounced out of.
      expect(router.state.historyAction).toBe("REPLACE");
    });

    it("lets / through once the boot-time refresh resolves a token", async () => {
      chatAuthRefresh.mockResolvedValue("fresh-token");

      renderAt(ROUTES.HOME);

      expect(
        await screen.findByRole("button", { name: "Sign out" }),
      ).toBeInTheDocument();
      expect(useAuthStore.getState().token).toBe("fresh-token");
    });

    it("bounces /sign-in to / with replace when a token is already present", async () => {
      useAuthStore.setState({ token: "a-token" });

      const router = renderAt(ROUTES.SIGN_IN);

      await screen.findByRole("button", { name: "Sign out" });
      expect(router.state.location.pathname).toBe(ROUTES.HOME);
      expect(router.state.historyAction).toBe("REPLACE");
    });

    it("renders 404 inside the shell for an unknown path, with no session required", async () => {
      chatAuthRefresh.mockRejectedValue(new Error("no session"));

      renderAt("/khong-ton-tai");

      expect(
        await screen.findByRole("heading", { name: "404 Not Found" }),
      ).toBeInTheDocument();
    });

    describe("the conversation screens", () => {
      beforeEach(() => {
        useAuthStore.setState({ token: "a-token" });
      });

      it("renders the sidebar with one conversation from the list", async () => {
        chatConversationGetConversations.mockResolvedValue({
          items: [
            {
              id: "c1",
              type: ChatConversationType.DIRECT,
              groupName: null,
              lastMessage: {
                id: "m1",
                conversationId: "c1",
                senderId: "u2",
                content: "See you tomorrow",
                type: ChatMessageType.TEXT,
                createdAt: "2026-09-16T00:00:00.000Z",
                updatedAt: "2026-09-16T00:00:00.000Z",
              },
              lastMessageAt: "2026-09-16T00:00:00.000Z",
              unreadCount: 2,
              participants: [
                {
                  userId: "u1",
                  firstName: "Tuan",
                  lastName: "Huynh",
                  role: ChatParticipantRole.MEMBER,
                },
                {
                  userId: "u2",
                  firstName: "Lan",
                  lastName: "Nguyen",
                  role: ChatParticipantRole.MEMBER,
                },
              ],
            },
          ],
          nextCursor: null,
        });

        renderAt(ROUTES.HOME);

        expect(await screen.findByText("Lan Nguyen")).toBeInTheDocument();
        expect(
          screen.getByText("Lan Nguyen: See you tomorrow"),
        ).toBeInTheDocument();
        expect(screen.getByText("2")).toBeInTheDocument();
      });

      it("shows the empty state when there are no conversations", async () => {
        renderAt(ROUTES.HOME);

        expect(
          await screen.findByText("No conversations to show."),
        ).toBeInTheDocument();
      });

      it("renders a conversation's message history and the other person's name at /conversation/:id", async () => {
        chatConversationGetConversations.mockResolvedValue({
          items: [
            {
              id: "c1",
              type: ChatConversationType.DIRECT,
              groupName: null,
              lastMessage: {
                id: "m1",
                conversationId: "c1",
                senderId: "u2",
                content: "Hey, are we still on for tomorrow?",
                type: ChatMessageType.TEXT,
                createdAt: "2026-09-16T08:00:00.000Z",
                updatedAt: "2026-09-16T08:00:00.000Z",
              },
              lastMessageAt: "2026-09-16T08:00:00.000Z",
              unreadCount: 0,
              participants: [
                {
                  userId: "u1",
                  firstName: "Tuan",
                  lastName: "Huynh",
                  role: ChatParticipantRole.MEMBER,
                },
                {
                  userId: "u2",
                  firstName: "Lan",
                  lastName: "Nguyen",
                  role: ChatParticipantRole.MEMBER,
                },
              ],
            },
          ],
          nextCursor: null,
        });
        chatMessageGetMessages.mockResolvedValue({
          items: [
            {
              id: "m1",
              conversationId: "c1",
              senderId: "u2",
              content: "Hey, are we still on for tomorrow?",
              type: ChatMessageType.TEXT,
              createdAt: "2026-09-16T08:00:00.000Z",
              updatedAt: "2026-09-16T08:00:00.000Z",
            },
          ],
          nextCursor: null,
        });

        renderAt(ROUTES.conversationByIdPath("c1"));

        // The panel header names the other participant.
        expect(
          await screen.findByRole("heading", { name: "Lan Nguyen" }),
        ).toBeInTheDocument();
        // "No messages yet." only renders on an empty result — its absence is
        // what proves the mocked page reached the mapped `messages` array.
        // (The bubble text itself renders inside a virtualized list that
        // `react-virtuoso`'s own jsdom test harness cannot paint for a
        // non-zero scroll-to-bottom target — see use-conversation-messages.test.tsx
        // for the same pipeline asserted directly on the hook's output.)
        await waitFor(() =>
          expect(
            screen.queryByText("No messages yet."),
          ).not.toBeInTheDocument(),
        );
        expect(chatMessageGetMessages).toHaveBeenCalledWith(
          "c1",
          expect.objectContaining({ cursor: undefined }),
        );
      });
    });
  });
});
