import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it } from "vitest";

import { ROUTES } from "~/constants/routes";
import ProtectedRoute from "~/features/auth/provider/protected-route";
import { useAuthStore } from "~/stores/use-auth-store";

// The real store, driven through its own API — mocking the module would throw
// away the selector behaviour the guard depends on.
const initialAuthState = useAuthStore.getState();

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={ROUTES.SIGN_IN} element={<p>sign-in screen</p>} />
        <Route element={<ProtectedRoute />}>
          <Route path={ROUTES.PATIENTS} element={<p>patients screen</p>} />
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

    renderAt(ROUTES.PATIENTS);

    expect(screen.getByText("patients screen")).toBeInTheDocument();
  });

  it("redirects to sign-in when there is no token", () => {
    renderAt(ROUTES.PATIENTS);

    expect(screen.getByText("sign-in screen")).toBeInTheDocument();
    expect(screen.queryByText("patients screen")).not.toBeInTheDocument();
  });
});
