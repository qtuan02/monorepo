import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ChatUserProfile } from "@monorepo/types/chat-user";

import { CurrentUserMenu } from "~/features/current-user/components/current-user-menu";
import { useAuthStore } from "~/stores/use-auth-store";

const { chatUserMe, chatAuthSignOut } = vi.hoisted(() => ({
  chatUserMe: vi.fn(),
  chatAuthSignOut: vi.fn(),
}));

vi.mock("~/libs/http-client", () => ({
  chatUserService: { me: chatUserMe },
  chatAuthService: { signOut: chatAuthSignOut },
}));

const CURRENT_USER: ChatUserProfile = {
  id: "u1",
  username: "tuanhq02",
  firstName: "Tuan",
  lastName: "Huynh",
};

function renderMenu() {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter>
        <CurrentUserMenu />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("CurrentUserMenu", () => {
  beforeEach(() => {
    useAuthStore.setState({ token: "a-token" });
    chatUserMe.mockReset().mockResolvedValue(CURRENT_USER);
    chatAuthSignOut.mockReset().mockResolvedValue(undefined);
  });

  it("opens the profile-edit dialog from a menu item without the menu swallowing the click", async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(await screen.findByRole("button", { name: /Tuan Huynh/ }));
    // Base UI's Menu.Item relies on a pointerdown/pointerup sequence
    // userEvent.click doesn't fully reproduce under jsdom — a plain click
    // event is what actually reaches its onClick handler here.
    fireEvent.click(
      await screen.findByRole("menuitem", { name: "Edit profile" }),
    );

    expect(
      await screen.findByRole("textbox", { name: "First name" }),
    ).toHaveValue("Tuan");
  });
});
