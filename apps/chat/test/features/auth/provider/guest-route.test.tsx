import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ROUTES } from "~/constants/routes";
import GuestRoute from "~/features/auth/provider/guest-route";
import { useAuthStore } from "~/stores/use-auth-store";

const initialAuthState = useAuthStore.getState();

const { chatAuthRefresh } = vi.hoisted(() => ({ chatAuthRefresh: vi.fn() }));

vi.mock("~/libs/http-client", () => ({
  chatAuthService: { refresh: chatAuthRefresh },
}));

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={ROUTES.HOME} element={<p>home screen</p>} />
        <Route element={<GuestRoute />}>
          <Route path={ROUTES.SIGN_IN} element={<p>sign-in screen</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("GuestRoute", () => {
  beforeEach(() => {
    useAuthStore.setState(initialAuthState, true);
    chatAuthRefresh.mockReset();
  });

  it("renders the guest screen straight away when there is no token and no cookie", async () => {
    chatAuthRefresh.mockRejectedValue(new Error("no session"));

    renderAt(ROUTES.SIGN_IN);

    expect(screen.getByText("Checking session...")).toBeInTheDocument();
    expect(await screen.findByText("sign-in screen")).toBeInTheDocument();
  });

  it("bounces to home straight away when a token is already present", () => {
    useAuthStore.setState({ token: "a-token" });

    renderAt(ROUTES.SIGN_IN);

    expect(screen.getByText("home screen")).toBeInTheDocument();
    expect(chatAuthRefresh).not.toHaveBeenCalled();
  });

  it("bounces to home once a still-good refresh cookie resolves a token", async () => {
    chatAuthRefresh.mockResolvedValue("fresh-token");

    renderAt(ROUTES.SIGN_IN);

    expect(await screen.findByText("home screen")).toBeInTheDocument();
    expect(useAuthStore.getState().token).toBe("fresh-token");
  });
});
