import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ROUTES } from "~/constants/routes";
import ProtectedRoute from "~/features/auth/provider/protected-route";
import { useAuthStore } from "~/stores/use-auth-store";

// The real store, driven through its own API — mocking the module would throw
// away the selector behaviour the guard depends on.
const initialAuthState = useAuthStore.getState();

const GUARDED_PATH = "/guarded";

const { chatAuthRefresh } = vi.hoisted(() => ({ chatAuthRefresh: vi.fn() }));

vi.mock("~/libs/http-client", () => ({
  chatAuthService: { refresh: chatAuthRefresh },
}));

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={ROUTES.SIGN_IN} element={<p>sign-in screen</p>} />
        <Route element={<ProtectedRoute />}>
          <Route path={GUARDED_PATH} element={<p>guarded screen</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    // `true` replaces rather than merges, so a token set by one test cannot
    // survive into the next.
    useAuthStore.setState(initialAuthState, true);
    chatAuthRefresh.mockReset();
  });

  it("renders the guarded route straight away when a token is already present", () => {
    useAuthStore.setState({ token: "a-token" });

    renderAt(GUARDED_PATH);

    expect(screen.getByText("guarded screen")).toBeInTheDocument();
    expect(chatAuthRefresh).not.toHaveBeenCalled();
  });

  it("shows the checking state, then redirects to sign-in when the refresh fails", async () => {
    chatAuthRefresh.mockRejectedValue(new Error("no session"));

    renderAt(GUARDED_PATH);

    expect(screen.getByText("Checking session...")).toBeInTheDocument();

    expect(await screen.findByText("sign-in screen")).toBeInTheDocument();
    expect(screen.queryByText("guarded screen")).not.toBeInTheDocument();
  });

  it("renders the guarded route once the boot-time refresh resolves a token", async () => {
    chatAuthRefresh.mockResolvedValue("fresh-token");

    renderAt(GUARDED_PATH);

    expect(await screen.findByText("guarded screen")).toBeInTheDocument();
    expect(useAuthStore.getState().token).toBe("fresh-token");
  });
});
