import type { ComponentProps } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { VirtuosoMockContext } from "react-virtuoso";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ChatUserProfile } from "@monorepo/types/chat-user";
import {
  ChatConversationType,
  ChatParticipantRole,
} from "@monorepo/types/chat-conversation";
import { FriendStatus } from "@monorepo/types/chat-friend";
import { ChatMessageType } from "@monorepo/types/chat-message";

import { ROUTES } from "~/constants/routes";
import { conversationQueryKeys } from "~/hooks/api/conversation";
import { AppRoutes } from "~/pages/main";
import { useAuthStore } from "~/stores/use-auth-store";
import { useSocketStore } from "~/stores/use-socket-store";

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
  chatUserSearch,
  chatUserInfo,
  chatUserUpdateMe,
  chatConversationGetConversations,
  chatConversationCreateGroup,
  chatConversationUpdateGroup,
  chatConversationAddMembers,
  chatConversationRemoveMember,
  chatConversationLeave,
  chatMessageGetMessages,
  chatFriendList,
  chatFriendRequests,
  chatFriendAccept,
  chatFriendDecline,
  chatFriendCancel,
  chatFriendRemove,
} = vi.hoisted(() => ({
  chatHealthCheck: vi.fn(),
  chatAuthRefresh: vi.fn(),
  chatAuthSignIn: vi.fn(),
  chatAuthSignUp: vi.fn(),
  chatUserMe: vi.fn(),
  chatUserSearch: vi.fn(),
  chatUserInfo: vi.fn(),
  chatUserUpdateMe: vi.fn(),
  chatConversationGetConversations: vi.fn(),
  chatConversationCreateGroup: vi.fn(),
  chatConversationUpdateGroup: vi.fn(),
  chatConversationAddMembers: vi.fn(),
  chatConversationRemoveMember: vi.fn(),
  chatConversationLeave: vi.fn(),
  chatMessageGetMessages: vi.fn(),
  chatFriendList: vi.fn(),
  chatFriendRequests: vi.fn(),
  chatFriendAccept: vi.fn(),
  chatFriendDecline: vi.fn(),
  chatFriendCancel: vi.fn(),
  chatFriendRemove: vi.fn(),
}));

vi.mock("~/libs/http-client", () => ({
  chatHealthService: { check: chatHealthCheck },
  chatAuthService: {
    refresh: chatAuthRefresh,
    signIn: chatAuthSignIn,
    signUp: chatAuthSignUp,
    signOut: vi.fn().mockResolvedValue(undefined),
  },
  chatUserService: {
    me: chatUserMe,
    search: chatUserSearch,
    updateMe: chatUserUpdateMe,
    info: chatUserInfo,
  },
  chatConversationService: {
    getConversations: chatConversationGetConversations,
    markAsSeen: vi.fn().mockResolvedValue(undefined),
    createGroup: chatConversationCreateGroup,
    updateGroup: chatConversationUpdateGroup,
    addMembers: chatConversationAddMembers,
    removeMember: chatConversationRemoveMember,
    leave: chatConversationLeave,
  },
  chatMessageService: { getMessages: chatMessageGetMessages },
  chatFriendService: {
    list: chatFriendList,
    requests: chatFriendRequests,
    send: vi.fn(),
    accept: chatFriendAccept,
    decline: chatFriendDecline,
    cancel: chatFriendCancel,
    remove: chatFriendRemove,
  },
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

// Spec #251's own seam: a conversation carrying this id makes the row/pane
// component that renders it throw during render — a TypeError, not a query
// error — so the Island fallback tests below prove a real render throw is
// caught, without needing a genuinely malformed backend record.
const THROWING_CONVERSATION_ID = "throwing-conversation";

vi.mock(
  "~/features/conversation/components/conversation-list-item",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("~/features/conversation/components/conversation-list-item")
      >();
    return {
      ...actual,
      default: (props: ComponentProps<typeof actual.default>) => {
        if (props.conversation.id === THROWING_CONVERSATION_ID) {
          throw new Error("Boom: a conversation row that cannot render");
        }
        return <actual.default {...props} />;
      },
    };
  },
);

vi.mock(
  "~/features/conversation/components/message-list",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("~/features/conversation/components/message-list")
      >();
    return {
      ...actual,
      default: (props: ComponentProps<typeof actual.default>) => {
        if (props.conversationId === THROWING_CONVERSATION_ID) {
          throw new Error("Boom: a message pane that cannot render");
        }
        return <actual.default {...props} />;
      },
    };
  },
);

/**
 * A data router with one splat route around `<AppRoutes />`, rather than a
 * `MemoryRouter`: only a data router exposes `state.historyAction`, which is
 * what proves a guard bounced with `replace` and not `push`. Wrapped in
 * Virtuoso's own test context (virtuoso.dev/testing) so the conversation and
 * message lists render deterministically with no ResizeObserver-driven
 * measurement to wait on.
 */
function renderAt(
  path: string,
  state?: unknown,
  queryClient: QueryClient = new QueryClient(),
) {
  const [pathname, search] = path.split("?");
  const router = createMemoryRouter([{ path: "*", element: <AppRoutes /> }], {
    initialEntries: [
      { pathname, search: search ? `?${search}` : undefined, state },
    ],
  });
  render(
    <QueryClientProvider client={queryClient}>
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
    useSocketStore.setState({
      client: null,
      isConnected: false,
      onlineUsers: [],
    });
    chatHealthCheck.mockReset();
    chatAuthRefresh.mockReset();
    chatUserMe.mockReset().mockResolvedValue(CURRENT_USER);
    chatUserInfo.mockReset().mockResolvedValue(null);
    chatUserSearch
      .mockReset()
      .mockResolvedValue({ items: [], nextOffset: null });
    chatConversationGetConversations
      .mockReset()
      .mockResolvedValue({ items: [], nextCursor: null });
    chatMessageGetMessages
      .mockReset()
      .mockResolvedValue({ items: [], nextCursor: null });
    chatFriendList
      .mockReset()
      .mockResolvedValue({ items: [], nextOffset: null });
    chatFriendRequests
      .mockReset()
      .mockResolvedValue({ sentRequests: [], receivedRequests: [] });
    chatFriendAccept.mockReset();
    chatFriendDecline.mockReset();
    chatFriendCancel.mockReset();
    chatFriendRemove.mockReset();
    chatUserUpdateMe.mockReset();
    chatConversationCreateGroup.mockReset();
    chatConversationUpdateGroup.mockReset();
    chatConversationAddMembers.mockReset();
    chatConversationRemoveMember.mockReset();
    chatConversationLeave.mockReset();
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

  it("shares one role=status boot Island between the Health gate and the session check, only the text changing", async () => {
    chatHealthCheck.mockResolvedValue(undefined);
    let rejectRefresh: ((error: Error) => void) | undefined;
    chatAuthRefresh.mockReturnValue(
      new Promise((_resolve, reject) => {
        rejectRefresh = reject;
      }),
    );

    renderAt(ROUTES.HOME);

    // First the Health gate's own phase of the same boot Island...
    expect(screen.getByRole("status")).toHaveTextContent(
      "Connecting to server...",
    );

    // ...then, once it resolves, the session guard's — same role, same
    // Island, only the line changing (no layout jump between the two).
    await screen.findByText("Checking session...");
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Checking session...");
    // No second, differently-shaped loading screen anywhere else in the tree.
    expect(screen.getAllByRole("status")).toHaveLength(1);

    // Settle the refresh so `use-session-check.ts`'s module-scoped
    // `pendingRefresh` clears — left pending, it would leak into whichever
    // test runs next.
    await act(async () => rejectRefresh?.(new Error("no session")));
  });

  it("adds the slow-connection line after 10s, and not before", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    chatHealthCheck.mockReturnValue(new Promise(() => {})); // never resolves
    chatAuthRefresh.mockRejectedValue(new Error("no session"));

    renderAt(ROUTES.SIGN_IN);

    expect(
      screen.queryByText("Still connecting — the server may be waking up"),
    ).not.toBeInTheDocument();

    // Two 5s steps rather than a 9_999/+1 split: `shouldAdvanceTime` also
    // ticks the mock clock by whatever real wall-time the render itself
    // took, so a boundary with no margin flakes on any extra render cost
    // (e.g. BootIsland's own useTranslation() subscription).
    await act(() => vi.advanceTimersByTimeAsync(5_000));
    expect(
      screen.queryByText("Still connecting — the server may be waking up"),
    ).not.toBeInTheDocument();

    await act(() => vi.advanceTimersByTimeAsync(5_000));
    expect(
      screen.getByText("Still connecting — the server may be waking up"),
    ).toBeInTheDocument();

    vi.useRealTimers();
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

      // The current-user menu trigger is the shell's own evidence it
      // rendered post-guard — "Sign out" now lives inside its menu.
      expect(
        await screen.findByRole("button", { name: /Tuan Huynh/ }),
      ).toBeInTheDocument();
      expect(useAuthStore.getState().token).toBe("fresh-token");
    });

    it("bounces /sign-in to / with replace when a token is already present", async () => {
      useAuthStore.setState({ token: "a-token" });

      const router = renderAt(ROUTES.SIGN_IN);

      await screen.findByRole("button", { name: /Tuan Huynh/ });
      expect(router.state.location.pathname).toBe(ROUTES.HOME);
      expect(router.state.historyAction).toBe("REPLACE");
    });

    it("renders 404 inside the shell for an unknown path, with no session required", async () => {
      chatAuthRefresh.mockRejectedValue(new Error("no session"));

      renderAt("/khong-ton-tai");

      expect(
        await screen.findByRole("heading", { name: "404 Not Found" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: /Back to Chats/ }),
      ).toHaveAttribute("href", ROUTES.HOME);
    });

    describe("the Islands shell", () => {
      beforeEach(() => {
        useAuthStore.setState({ token: "a-token" });
        // Three conversations, two of them unread — the badge counts
        // conversations, not messages (brief §10 row 17), so this must
        // read 2, not the sum of their unreadCount (5 + 1 = 6).
        chatConversationGetConversations.mockResolvedValue({
          items: [
            {
              id: "c1",
              type: ChatConversationType.DIRECT,
              groupName: null,
              lastMessage: null,
              lastMessageAt: null,
              unreadCount: 5,
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
            {
              id: "c2",
              type: ChatConversationType.DIRECT,
              groupName: null,
              lastMessage: null,
              lastMessageAt: null,
              unreadCount: 1,
              participants: [
                {
                  userId: "u1",
                  firstName: "Tuan",
                  lastName: "Huynh",
                  role: ChatParticipantRole.MEMBER,
                },
                {
                  userId: "u3",
                  firstName: "Minh",
                  lastName: "Tran",
                  role: ChatParticipantRole.MEMBER,
                },
              ],
            },
            {
              id: "c3",
              type: ChatConversationType.DIRECT,
              groupName: null,
              lastMessage: null,
              lastMessageAt: null,
              unreadCount: 0,
              participants: [
                {
                  userId: "u1",
                  firstName: "Tuan",
                  lastName: "Huynh",
                  role: ChatParticipantRole.MEMBER,
                },
                {
                  userId: "u4",
                  firstName: "An",
                  lastName: "Le",
                  role: ChatParticipantRole.MEMBER,
                },
              ],
            },
          ],
          nextCursor: null,
        });
        chatFriendRequests.mockResolvedValue({
          sentRequests: [],
          receivedRequests: [
            {
              id: "r1",
              user: {
                id: "u5",
                username: "hoa",
                firstName: "Hoa",
                lastName: "Pham",
              },
              message: null,
              createdAt: "2026-09-19T00:00:00.000Z",
            },
          ],
        });
      });

      it("shows the Rail on desktop, marks the current page and no other, and shows no Bottom nav", async () => {
        renderAt(ROUTES.FRIENDS);

        const nav = await screen.findByRole("navigation", { name: "Primary" });
        const chats = within(nav).getByRole("link", { name: /Chats/ });
        const friends = within(nav).getByRole("link", { name: /Friends/ });
        const profile = within(nav).getByRole("link", { name: /Profile/ });

        expect(friends).toHaveAttribute("aria-current", "page");
        expect(chats).not.toHaveAttribute("aria-current");
        expect(profile).not.toHaveAttribute("aria-current");

        // Friends badge: pending received requests (1) — this screen owns
        // that query, so the badge reads it off the cache.
        expect(await within(friends).findByText("1")).toBeInTheDocument();
        // The nav is not the reason /friends loads conversations: the badge
        // only reads the cache, and nothing on this screen fetched the list.
        expect(chatConversationGetConversations).not.toHaveBeenCalled();
        expect(within(chats).queryByText("2")).not.toBeInTheDocument();

        expect(screen.queryAllByRole("navigation")).toHaveLength(1);
      });

      it("marks Chats current for a conversation screen too, reached from that list", async () => {
        renderAt(ROUTES.conversationByIdPath("c1"));

        const nav = await screen.findByRole("navigation", { name: "Primary" });
        expect(
          within(nav).getByRole("link", { name: /Chats/ }),
        ).toHaveAttribute("aria-current", "page");
      });

      describe("on a mobile viewport", () => {
        let originalMatchMedia: typeof window.matchMedia;

        beforeEach(() => {
          originalMatchMedia = window.matchMedia;
          window.matchMedia = (query: string) =>
            ({
              matches: query.includes("max-width"),
              media: query,
              onchange: null,
              addListener: () => {},
              removeListener: () => {},
              addEventListener: () => {},
              removeEventListener: () => {},
              dispatchEvent: () => false,
            }) as unknown as MediaQueryList;
        });

        afterEach(() => {
          window.matchMedia = originalMatchMedia;
        });

        it("shows a 3-item Bottom nav on the conversation list, with the same badges as the Rail", async () => {
          renderAt(ROUTES.HOME);

          const nav = await screen.findByRole("navigation", {
            name: "Primary",
          });
          const links = within(nav).getAllByRole("link");
          expect(links).toHaveLength(3);

          const chats = within(nav).getByRole("link", { name: /Chats/ });
          const me = within(nav).getByRole("link", { name: /Me/ });
          // Chats badge: conversations with unread > 0 (2), not the total (6).
          expect(await within(chats).findByText("2")).toBeInTheDocument();
          expect(chats).toHaveAttribute("aria-current", "page");
          expect(me).not.toHaveAttribute("aria-current");
          // And the mirror: the conversation list does not load the request
          // queue on its way in.
          expect(chatFriendRequests).not.toHaveBeenCalled();
        });

        it("hides the Bottom nav once a real conversation is open", async () => {
          renderAt(ROUTES.conversationByIdPath("c1"));

          await screen.findByRole("heading", { name: "Lan Nguyen" });
          expect(
            screen.queryByRole("navigation", { name: "Primary" }),
          ).not.toBeInTheDocument();
        });

        it("hides the Bottom nav for a Draft conversation on Home", async () => {
          renderAt(ROUTES.HOME, {
            directMessageDraftUser: {
              id: "u9",
              username: "hoa",
              firstName: "Hoa",
              lastName: "Pham",
            },
          });

          await screen.findByRole("heading", { name: "Hoa Pham" });
          expect(
            screen.queryByRole("navigation", { name: "Primary" }),
          ).not.toBeInTheDocument();
        });

        it("signs out from the Sign out row on /profile — the Bottom nav's 'Me' needs no dropdown", async () => {
          const user = userEvent.setup();
          renderAt(ROUTES.PROFILE);

          await user.click(
            await screen.findByRole("button", { name: "Sign out" }),
          );

          expect(
            await screen.findByRole("heading", { name: "Welcome back" }),
          ).toBeInTheDocument();
        });
      });

      // The broker buffers nothing: a `conversation.updated` fired while the
      // visitor sits on /friends or /profile is lost unless the user-wide
      // subscription is mounted there too — which is how a friend's first
      // message went missing until their second one (2026-09-21).
      it.each([ROUTES.FRIENDS, ROUTES.PROFILE])(
        "keeps the conversation-updates subscription mounted on %s",
        async (path) => {
          const subscribe = vi.fn(() => ({ unsubscribe: vi.fn() }));
          useSocketStore.setState({
            client: { subscribe } as never,
            isConnected: true,
          });

          renderAt(path);

          await waitFor(() =>
            expect(subscribe).toHaveBeenCalledWith(
              "/user/queue/conversations",
              expect.any(Function),
            ),
          );
        },
      );
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

      it("previews the visitor's own last message as 'You: …'", async () => {
        chatConversationGetConversations.mockResolvedValue({
          items: [
            {
              id: "c1",
              type: ChatConversationType.DIRECT,
              groupName: null,
              lastMessage: {
                id: "m1",
                conversationId: "c1",
                senderId: "u1",
                content: "See you tomorrow",
                type: ChatMessageType.TEXT,
                createdAt: "2026-09-16T00:00:00.000Z",
                updatedAt: "2026-09-16T00:00:00.000Z",
              },
              lastMessageAt: "2026-09-16T00:00:00.000Z",
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

        renderAt(ROUTES.HOME);

        expect(
          await screen.findByText("You: See you tomorrow"),
        ).toBeInTheDocument();
      });

      it("asks the service for GROUP conversations under the Groups chip, keyed apart from the default list", async () => {
        const user = userEvent.setup();
        chatConversationGetConversations.mockImplementation((params) =>
          Promise.resolve({
            items:
              params.type === ChatConversationType.GROUP
                ? [
                    {
                      id: "g1",
                      type: ChatConversationType.GROUP,
                      groupName: "Team Alpha",
                      lastMessage: null,
                      lastMessageAt: null,
                      unreadCount: 0,
                      participants: [],
                    },
                  ]
                : [
                    {
                      id: "c1",
                      type: ChatConversationType.DIRECT,
                      groupName: null,
                      lastMessage: null,
                      lastMessageAt: null,
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
          }),
        );

        const router = renderAt(ROUTES.HOME);

        expect(await screen.findByText("Lan Nguyen")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Groups" }));

        expect(await screen.findByText("Team Alpha")).toBeInTheDocument();
        expect(screen.queryByText("Lan Nguyen")).not.toBeInTheDocument();
        expect(chatConversationGetConversations).toHaveBeenCalledWith(
          expect.objectContaining({ type: "GROUP" }),
        );
        expect(router.state.location.search).toBe("?filter=groups");
      });

      it("keeps a conversation under Unread after its unreadCount returns to 0", async () => {
        const user = userEvent.setup();
        const queryClient = new QueryClient();
        chatConversationGetConversations.mockResolvedValue({
          items: [
            {
              id: "c1",
              type: ChatConversationType.DIRECT,
              groupName: null,
              lastMessage: null,
              lastMessageAt: null,
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

        renderAt(ROUTES.HOME, undefined, queryClient);

        await screen.findByText("Lan Nguyen");
        await user.click(screen.getByRole("button", { name: "Unread" }));
        expect(screen.getByText("Lan Nguyen")).toBeInTheDocument();

        // The visitor opened it — a live `conversation.seen` patches the
        // cache exactly this way (applyConversationSeenToCache).
        queryClient.setQueriesData(
          { queryKey: conversationQueryKeys.list() },
          (data: unknown) => {
            const infinite = data as {
              pages: { items: { id: string; unreadCount: number }[] }[];
            };
            return {
              ...infinite,
              pages: infinite.pages.map((page) => ({
                ...page,
                items: page.items.map((item) =>
                  item.id === "c1" ? { ...item, unreadCount: 0 } : item,
                ),
              })),
            };
          },
        );

        // Still on screen — the kept set survives the drop to zero.
        expect(screen.getByText("Lan Nguyen")).toBeInTheDocument();
      });

      it("searches people alongside chats — friend or not — and opens a Draft conversation from a result", async () => {
        const user = userEvent.setup();
        chatUserSearch.mockResolvedValue({
          items: [
            {
              id: "u3",
              username: "an.pham",
              firstName: "An",
              lastName: "Pham",
              joinedAt: "2026-09-01T00:00:00.000Z",
              statusFriend: FriendStatus.NONE,
            },
          ],
          nextOffset: null,
        });
        chatConversationGetConversations.mockResolvedValue({
          items: [
            {
              id: "c1",
              type: ChatConversationType.DIRECT,
              groupName: null,
              lastMessage: null,
              lastMessageAt: null,
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

        renderAt(ROUTES.HOME);

        await screen.findByText("Lan Nguyen");
        await user.type(
          screen.getByPlaceholderText("Search chats and people"),
          "pham",
        );

        // No loaded chat matches "pham", so only the People section shows —
        // and a stranger (statusFriend NONE) is still a result.
        expect(await screen.findByText("An Pham")).toBeInTheDocument();
        expect(screen.queryByText("Lan Nguyen")).not.toBeInTheDocument();
        expect(chatUserSearch).toHaveBeenCalledWith(
          expect.objectContaining({ search: "pham" }),
        );

        await user.click(screen.getByText("An Pham"));

        expect(
          await screen.findByRole("heading", { name: "An Pham" }),
        ).toBeInTheDocument();
      });

      it("opens Create group straight from the + button, with no menu in between", async () => {
        const user = userEvent.setup();
        renderAt(ROUTES.HOME);

        await user.click(
          await screen.findByRole("button", { name: "New group" }),
        );

        expect(
          await screen.findByRole("heading", {
            name: "Create group conversation",
          }),
        ).toBeInTheDocument();
      });

      it("shows the empty state pointing at search when there are no conversations", async () => {
        renderAt(ROUTES.HOME);

        expect(
          await screen.findByText("No conversations yet"),
        ).toBeInTheDocument();
        // Starting a chat is the search box's job now — no second entry.
        expect(
          screen.queryByRole("button", { name: "New message" }),
        ).not.toBeInTheDocument();
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

      it("shows the group header's 'N members · M online' line, excluding the signed-in visitor from the online count", async () => {
        chatConversationGetConversations.mockResolvedValue({
          items: [
            {
              id: "g1",
              type: ChatConversationType.GROUP,
              groupName: "Team Alpha",
              lastMessage: null,
              lastMessageAt: null,
              unreadCount: 0,
              participants: [
                {
                  userId: "u1",
                  firstName: "Tuan",
                  lastName: "Huynh",
                  role: ChatParticipantRole.ADMIN,
                },
                {
                  userId: "u2",
                  firstName: "Lan",
                  lastName: "Nguyen",
                  role: ChatParticipantRole.MEMBER,
                },
                {
                  userId: "u3",
                  firstName: "Minh",
                  lastName: "Tran",
                  role: ChatParticipantRole.MEMBER,
                },
              ],
            },
          ],
          nextCursor: null,
        });
        useSocketStore.setState({
          isConnected: true,
          onlineUsers: ["u1", "u3"],
        });

        renderAt(ROUTES.conversationByIdPath("g1"));

        await screen.findByRole("heading", { name: "Team Alpha" });
        // u1 is the signed-in visitor and must not count toward "online".
        expect(screen.getByText("3 members · 1 online")).toBeInTheDocument();
      });

      it("shows a 'Reconnecting…' pill in the pane header instead of presence while the socket is disconnected", async () => {
        chatConversationGetConversations.mockResolvedValue({
          items: [
            {
              id: "c1",
              type: ChatConversationType.DIRECT,
              groupName: null,
              lastMessage: null,
              lastMessageAt: null,
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
        // A stale online snapshot from before the drop — must not leak through.
        useSocketStore.setState({ isConnected: false, onlineUsers: ["u2"] });

        renderAt(ROUTES.conversationByIdPath("c1"));

        await screen.findByRole("heading", { name: "Lan Nguyen" });
        expect(screen.getByText("Reconnecting…")).toBeInTheDocument();
        expect(screen.queryByText("Active now")).not.toBeInTheDocument();
      });

      // The "Seen" text / reader avatar stack render inside MessageRow, which
      // sits inside a Virtuoso list this route tree's jsdom harness cannot
      // paint at a non-zero scroll-to-bottom target (see the note on the
      // "renders a conversation's message history" test above) — that
      // behaviour is instead covered directly: readers-of.test.ts (the pure
      // derivation) and message-row.test.tsx (the rendered row).
    });

    describe("Island fallback (#252)", () => {
      beforeEach(() => {
        useAuthStore.setState({ token: "a-token" });
      });

      function directConversation(id: string, otherName: string) {
        return {
          id,
          type: ChatConversationType.DIRECT,
          groupName: null,
          lastMessage: null,
          lastMessageAt: null,
          unreadCount: 0,
          participants: [
            {
              userId: "u1",
              firstName: "Tuan",
              lastName: "Huynh",
              role: ChatParticipantRole.MEMBER,
            },
            {
              userId: `member-of-${id}`,
              firstName: otherName,
              lastName: "",
              role: ChatParticipantRole.MEMBER,
            },
          ],
        };
      }

      it("shows the list Island's own fallback when a row throws, keeping the pane and the Rail alive", async () => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        chatConversationGetConversations.mockResolvedValue({
          items: [directConversation(THROWING_CONVERSATION_ID, "Lan")],
          nextCursor: null,
        });

        renderAt(ROUTES.HOME);

        expect(
          await screen.findByText("This section couldn't load."),
        ).toBeInTheDocument();
        // Two separate Islands on the same screen — the pane's own empty
        // state and the Rail — are untouched by the list Island's throw.
        expect(screen.getByText("Pick a conversation")).toBeInTheDocument();
        expect(
          screen.getByRole("navigation", { name: "Primary" }),
        ).toBeInTheDocument();

        vi.mocked(console.error).mockRestore();
      });

      it('shows "couldn\'t load" with Retry on a rejected list query, never the empty state', async () => {
        chatConversationGetConversations.mockRejectedValue(
          new Error("network down"),
        );

        renderAt(
          ROUTES.HOME,
          undefined,
          new QueryClient({ defaultOptions: { queries: { retry: false } } }),
        );

        expect(
          await screen.findByText("Couldn't load your conversations."),
        ).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: "Retry" }),
        ).toBeInTheDocument();
        expect(screen.queryByText("No chats yet")).not.toBeInTheDocument();
      });

      it("clears the pane's fallback with no click once the conversationId it is keyed on changes", async () => {
        const user = userEvent.setup();
        vi.spyOn(console, "error").mockImplementation(() => {});
        chatConversationGetConversations.mockResolvedValue({
          items: [directConversation("safe-id", "Lan")],
          nextCursor: null,
        });
        chatMessageGetMessages.mockResolvedValue({
          items: [],
          nextCursor: null,
        });

        renderAt(ROUTES.conversationByIdPath(THROWING_CONVERSATION_ID));

        expect(
          await screen.findByText("This section couldn't load."),
        ).toBeInTheDocument();

        // The sidebar is a separate Island — the throwing conversationId in
        // the URL isn't even in its loaded list, so it renders normally.
        await user.click(await screen.findByRole("link", { name: /Lan/ }));

        expect(
          screen.queryByText("This section couldn't load."),
        ).not.toBeInTheDocument();
        // The pane's own empty state — scoped, since "No messages yet." also
        // names the freshly-opened conversation's preview text in the sidebar.
        await waitFor(() =>
          expect(
            screen.getAllByText("No messages yet.").length,
          ).toBeGreaterThan(0),
        );

        vi.mocked(console.error).mockRestore();
      });
    });

    describe("the /friends screen", () => {
      beforeEach(() => {
        useAuthStore.setState({ token: "a-token" });
      });

      it("opens on the Friends tab by default, listing a friend with Message + Unfriend", async () => {
        chatFriendList.mockResolvedValue({
          items: [
            {
              id: "u2",
              username: "lan",
              firstName: "Lan",
              lastName: "Nguyen",
              joinedAt: "2026-01-01T00:00:00.000Z",
            },
          ],
          nextOffset: null,
        });

        renderAt(ROUTES.FRIENDS);

        expect(
          await screen.findByRole("tab", { name: "Friends", selected: true }),
        ).toBeInTheDocument();
        expect(await screen.findByText("Lan Nguyen")).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: "Message" }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: "Unfriend" }),
        ).toBeInTheDocument();
      });

      it("opens Requests from ?tab=requests, badged and split Received/Sent", async () => {
        const user = userEvent.setup();
        chatFriendRequests.mockResolvedValue({
          sentRequests: [
            {
              id: "r2",
              user: {
                id: "u4",
                username: "hoa",
                firstName: "Hoa",
                lastName: "Pham",
              },
              message: null,
              createdAt: "2026-09-19T00:00:00.000Z",
            },
          ],
          receivedRequests: [
            {
              id: "r1",
              user: {
                id: "u3",
                username: "minh",
                firstName: "Minh",
                lastName: "Tran",
              },
              message: null,
              createdAt: "2026-09-19T00:00:00.000Z",
            },
          ],
        });

        renderAt(`${ROUTES.FRIENDS}?tab=requests`);

        const requestsTab = await screen.findByRole("tab", {
          name: /Requests/,
          selected: true,
        });
        // The badge counts received requests only (1), not both queues.
        expect(await within(requestsTab).findByText("1")).toBeInTheDocument();

        expect(await screen.findByText("Minh Tran")).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: "Accept" }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: "Decline" }),
        ).toBeInTheDocument();
        expect(screen.getByText("Hoa Pham")).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: "Cancel request" }),
        ).toBeInTheDocument();

        // Switching to Friends leaves Requests' content unmounted.
        await user.click(screen.getByRole("tab", { name: /Friends/ }));
        expect(screen.queryByText("Minh Tran")).not.toBeInTheDocument();
      });

      it("shows 'No one found' on an empty Find people search, opened straight from ?tab=find", async () => {
        chatUserSearch.mockResolvedValue({ items: [], nextOffset: null });

        renderAt(`${ROUTES.FRIENDS}?tab=find`);

        await screen.findByRole("tab", { name: "Find people", selected: true });
        await userEvent
          .setup()
          .type(
            screen.getByPlaceholderText("Search by name or username"),
            "nobody",
          );

        expect(await screen.findByText("No one found")).toBeInTheDocument();
      });

      // The backend echoes the searcher back as `SELF`; every result list
      // reads the hook's filtered output, so a search for one's own name is
      // an empty search (2026-09-21).
      it("never lists the signed-in visitor among Find people results", async () => {
        chatUserSearch.mockResolvedValue({
          items: [
            {
              ...CURRENT_USER,
              joinedAt: "2026-09-01T00:00:00.000Z",
              statusFriend: FriendStatus.SELF,
            },
          ],
          nextOffset: null,
        });

        renderAt(`${ROUTES.FRIENDS}?tab=find`);

        await screen.findByRole("tab", { name: "Find people", selected: true });
        await userEvent
          .setup()
          .type(
            screen.getByPlaceholderText("Search by name or username"),
            "tuan",
          );

        expect(await screen.findByText("No one found")).toBeInTheDocument();
        expect(screen.queryByText("Tuan Huynh")).not.toBeInTheDocument();
      });

      it("shows the empty states when there are no friends or requests", async () => {
        renderAt(ROUTES.FRIENDS);

        expect(
          await screen.findByText("No friends added yet."),
        ).toBeInTheDocument();

        await userEvent
          .setup()
          .click(screen.getByRole("tab", { name: /Requests/ }));
        expect(
          await screen.findByText("No received requests."),
        ).toBeInTheDocument();
        expect(screen.getByText("No sent requests.")).toBeInTheDocument();
      });
    });

    describe("the /profile screen", () => {
      beforeEach(() => {
        useAuthStore.setState({ token: "a-token" });
      });

      it("renders the current user's name from the mock", async () => {
        renderAt(ROUTES.PROFILE);

        // "Tuan Huynh" also names the header's current-user trigger — the
        // username line is the page's own, unambiguous evidence.
        expect(await screen.findByText("@tuanhq02")).toBeInTheDocument();
        expect(screen.getAllByText("Tuan Huynh").length).toBeGreaterThan(0);
      });

      it("edits in place — Edit profile swaps the fields for inputs, Save writes and returns to view", async () => {
        const user = userEvent.setup();
        chatUserUpdateMe.mockImplementation(async (payload) => ({
          ...CURRENT_USER,
          ...payload,
        }));

        renderAt(ROUTES.PROFILE);

        await screen.findByText("@tuanhq02");
        // View mode: values are text, no inputs and no Save.
        expect(screen.queryByRole("textbox")).not.toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Edit profile" }));

        const firstName = await screen.findByRole("textbox", {
          name: "First name",
        });
        expect(firstName).toHaveValue("Tuan");
        await user.clear(firstName);
        await user.type(firstName, "Anh");
        await user.type(
          screen.getByRole("textbox", { name: "Email" }),
          "tuan@example.com",
        );
        await user.click(screen.getByRole("button", { name: "Save" }));

        expect(chatUserUpdateMe).toHaveBeenCalledWith(
          expect.objectContaining({ firstName: "Anh", username: "tuanhq02" }),
        );
        // Back in view mode, showing the saved profile.
        expect(
          await screen.findByRole("button", { name: "Edit profile" }),
        ).toBeInTheDocument();
        expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
        expect(screen.getAllByText("Anh Huynh").length).toBeGreaterThan(0);
      });

      it("has no Edit profile item in the Rail menu — View profile is the only entry besides Sign out", async () => {
        const user = userEvent.setup();
        renderAt(ROUTES.HOME);

        await user.click(
          await screen.findByRole("button", { name: "Tuan Huynh" }),
        );

        expect(
          await screen.findByRole("menuitem", { name: "View profile" }),
        ).toBeInTheDocument();
        expect(
          screen.queryByRole("menuitem", { name: "Edit profile" }),
        ).not.toBeInTheDocument();
      });
    });

    describe("a group conversation's details panel", () => {
      beforeEach(() => {
        useAuthStore.setState({ token: "a-token" });
      });

      it("lists every member, badges only the owner, and lets the owner Add members / rename", async () => {
        const user = userEvent.setup();
        chatConversationGetConversations.mockResolvedValue({
          items: [
            {
              id: "g1",
              type: ChatConversationType.GROUP,
              groupName: "Team Alpha",
              lastMessage: null,
              lastMessageAt: null,
              unreadCount: 0,
              participants: [
                {
                  userId: "u1",
                  firstName: "Tuan",
                  lastName: "Huynh",
                  role: ChatParticipantRole.ADMIN,
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

        renderAt(ROUTES.conversationByIdPath("g1"));

        await user.click(
          await screen.findByRole("button", { name: "Conversation details" }),
        );

        const membersHeading = await screen.findByText("Members · 2");
        const memberList = within(membersHeading.parentElement as HTMLElement);

        expect(memberList.getByText("Tuan Huynh")).toBeInTheDocument();
        expect(memberList.getByText("Owner")).toBeInTheDocument();
        expect(memberList.getByText("Lan Nguyen")).toBeInTheDocument();
        expect(memberList.queryByText("Member")).not.toBeInTheDocument();

        // The signed-in visitor is the ADMIN here, so both owner-only
        // controls render (story 46).
        expect(
          screen.getByRole("button", { name: "Add members" }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: "Rename group" }),
        ).toBeInTheDocument();
      });

      it("hides Add members and rename from a regular member (story 47)", async () => {
        const user = userEvent.setup();
        chatConversationGetConversations.mockResolvedValue({
          items: [
            {
              id: "g1",
              type: ChatConversationType.GROUP,
              groupName: "Team Alpha",
              lastMessage: null,
              lastMessageAt: null,
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
                  role: ChatParticipantRole.ADMIN,
                },
              ],
            },
          ],
          nextCursor: null,
        });

        renderAt(ROUTES.conversationByIdPath("g1"));

        await user.click(
          await screen.findByRole("button", { name: "Conversation details" }),
        );

        await screen.findByText("Members · 2");

        expect(
          screen.queryByRole("button", { name: "Add members" }),
        ).not.toBeInTheDocument();
        expect(
          screen.queryByRole("button", { name: "Rename group" }),
        ).not.toBeInTheDocument();
        // Leaving stays open to every member.
        expect(
          screen.getByRole("button", { name: "Leave group" }),
        ).toBeInTheDocument();
      });
    });

    describe("a direct conversation's details panel", () => {
      beforeEach(() => {
        useAuthStore.setState({ token: "a-token" });
      });

      const TWO_DIRECT_CONVERSATIONS = {
        items: [
          {
            id: "c1",
            type: ChatConversationType.DIRECT,
            groupName: null,
            lastMessage: null,
            lastMessageAt: null,
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
                username: "lan",
                firstName: "Lan",
                lastName: "Nguyen",
                role: ChatParticipantRole.MEMBER,
              },
            ],
          },
          {
            id: "c2",
            type: ChatConversationType.DIRECT,
            groupName: null,
            lastMessage: null,
            lastMessageAt: null,
            unreadCount: 0,
            participants: [
              {
                userId: "u1",
                firstName: "Tuan",
                lastName: "Huynh",
                role: ChatParticipantRole.MEMBER,
              },
              {
                userId: "u3",
                username: "minh",
                firstName: "Minh",
                lastName: "Tran",
                role: ChatParticipantRole.MEMBER,
              },
            ],
          },
        ],
        nextCursor: null,
      };

      it("shows the other person's avatar, name, username and an Unfriend action", async () => {
        const user = userEvent.setup();
        chatConversationGetConversations.mockResolvedValue(
          TWO_DIRECT_CONVERSATIONS,
        );
        // The Unfriend action only shows once the fetched profile confirms
        // FRIEND — see conversation-details-panel.tsx.
        chatUserInfo.mockResolvedValue({ statusFriend: FriendStatus.FRIEND });

        renderAt(ROUTES.conversationByIdPath("c1"));

        await user.click(
          await screen.findByRole("button", { name: "Conversation details" }),
        );

        const panelHeading = await screen.findByRole("heading", {
          name: "Profile",
        });
        const panel = within(
          panelHeading.parentElement?.parentElement as HTMLElement,
        );

        expect(panel.getByText("Lan Nguyen")).toBeInTheDocument();
        expect(panel.getByText("@lan")).toBeInTheDocument();
        // "View profile" opens the shared read-only detail dialog — its own
        // content is covered in test/components/user-detail-dialog.test.tsx.
        expect(
          panel.getByRole("button", { name: "View profile" }),
        ).toBeEnabled();

        await user.click(
          await panel.findByRole("button", { name: "Unfriend" }),
        );
        await user.click(await screen.findByRole("button", { name: "Confirm" }));

        expect(chatFriendRemove).toHaveBeenCalledWith("u2");
      });

      it("hides Unfriend for a direct conversation with someone who isn't a friend", async () => {
        const user = userEvent.setup();
        chatConversationGetConversations.mockResolvedValue(
          TWO_DIRECT_CONVERSATIONS,
        );
        chatUserInfo.mockResolvedValue({ statusFriend: FriendStatus.NONE });

        renderAt(ROUTES.conversationByIdPath("c1"));

        await user.click(
          await screen.findByRole("button", { name: "Conversation details" }),
        );

        const panelHeading = await screen.findByRole("heading", {
          name: "Profile",
        });
        const panel = within(
          panelHeading.parentElement?.parentElement as HTMLElement,
        );

        expect(
          await panel.findByRole("button", { name: "View profile" }),
        ).toBeEnabled();
        expect(
          panel.queryByRole("button", { name: "Unfriend" }),
        ).not.toBeInTheDocument();
      });

      it("keeps Details open when navigating from one conversation to another in the same session", async () => {
        const user = userEvent.setup();
        chatConversationGetConversations.mockResolvedValue(
          TWO_DIRECT_CONVERSATIONS,
        );

        renderAt(ROUTES.conversationByIdPath("c1"));

        await user.click(
          await screen.findByRole("button", { name: "Conversation details" }),
        );
        expect(
          await screen.findByRole("heading", { name: "Profile" }),
        ).toBeInTheDocument();

        await user.click(screen.getByRole("link", { name: /Minh Tran/ }));

        // Still open — over the newly active conversation's own person.
        const closeButton = await screen.findByRole("button", {
          name: "Close details",
        });
        const panel = within(
          closeButton.parentElement?.parentElement as HTMLElement,
        );
        expect(await panel.findByText("Minh Tran")).toBeInTheDocument();
        expect(panel.getByText("@minh")).toBeInTheDocument();
      });
    });
  });
});
