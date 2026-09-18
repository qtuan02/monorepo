import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it } from "vitest";

import { ROUTES } from "~/constants/routes";
import ProtectedRoute from "~/features/auth/provider/protected-route";
import { useAuthStore } from "~/stores/use-auth-store";

// The real store, driven through its own API — mocking the module would throw
// away the selector behaviour the guard depends on.
const initialAuthState = useAuthStore.getState();

// An arbitrary path stands in for a real guarded screen — none exists yet in
// this skeleton, and the guard's behaviour does not depend on which path it
// wraps.
const GUARDED_PATH = "/guarded";

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
  });

  it("renders the guarded route when a token is present", () => {
    useAuthStore.setState({ token: "a-token" });

    renderAt(GUARDED_PATH);

    expect(screen.getByText("guarded screen")).toBeInTheDocument();
  });

  it("redirects to sign-in when there is no token", () => {
    renderAt(GUARDED_PATH);

    expect(screen.getByText("sign-in screen")).toBeInTheDocument();
    expect(screen.queryByText("guarded screen")).not.toBeInTheDocument();
  });
});
