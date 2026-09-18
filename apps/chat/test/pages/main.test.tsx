import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

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

const { chatHealthCheck, chatAuthRefresh, chatAuthSignIn, chatAuthSignUp } =
  vi.hoisted(() => ({
    chatHealthCheck: vi.fn(),
    chatAuthRefresh: vi.fn(),
    chatAuthSignIn: vi.fn(),
    chatAuthSignUp: vi.fn(),
  }));

vi.mock("~/libs/http-client", () => ({
  chatHealthService: { check: chatHealthCheck },
  chatAuthService: {
    refresh: chatAuthRefresh,
    signIn: chatAuthSignIn,
    signUp: chatAuthSignUp,
    signOut: vi.fn().mockResolvedValue(undefined),
  },
  chatUserService: { me: vi.fn() },
}));

/**
 * A data router with one splat route around `<AppRoutes />`, rather than a
 * `MemoryRouter`: only a data router exposes `state.historyAction`, which is
 * what proves a guard bounced with `replace` and not `push`.
 */
function renderAt(path: string) {
  const router = createMemoryRouter([{ path: "*", element: <AppRoutes /> }], {
    initialEntries: [path],
  });
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RouterProvider router={router} />
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
  });
});
