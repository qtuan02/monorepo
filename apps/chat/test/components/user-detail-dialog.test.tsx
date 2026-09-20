import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ChatUserInfo } from "@monorepo/types/chat-user";
import { FriendStatus } from "@monorepo/types/chat-friend";

import { UserDetailDialog } from "~/components/user-detail-dialog";
import { UserItem } from "~/components/user-item";
import { useSocketStore } from "~/stores/use-socket-store";

const { chatUserInfo, chatConversationGetConversations } = vi.hoisted(() => ({
  chatUserInfo: vi.fn(),
  chatConversationGetConversations: vi.fn(),
}));

vi.mock("~/libs/http-client", () => ({
  chatUserService: { info: chatUserInfo },
  chatConversationService: {
    getConversations: chatConversationGetConversations,
  },
}));

// A real zustand store with a static presence snapshot, never a live socket
// (the same seam test/pages/main.test.tsx uses).
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

const LAN: ChatUserInfo = {
  id: "u2",
  username: "lan",
  firstName: "Lan",
  lastName: "Nguyen",
  bio: "Hello there",
  email: "lan@example.com",
  joinedAt: "2026-01-15T00:00:00.000Z",
  statusFriend: FriendStatus.FRIEND,
};

function renderWithProviders(ui: React.ReactElement) {
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("UserDetailDialog", () => {
  beforeEach(() => {
    useSocketStore.setState({ onlineUsers: [] });
    chatUserInfo.mockReset().mockResolvedValue(LAN);
    chatConversationGetConversations
      .mockReset()
      .mockResolvedValue({ items: [], nextCursor: null });
  });

  it("fetches the person on open and shows every field — a dash where the profile left one blank", async () => {
    useSocketStore.setState({ onlineUsers: ["u2"] });
    renderWithProviders(
      <UserDetailDialog userId="u2" open onOpenChange={vi.fn()} />,
    );

    expect(
      await screen.findByRole("heading", { name: "Lan Nguyen" }),
    ).toBeInTheDocument();
    expect(chatUserInfo).toHaveBeenCalledWith("u2");
    expect(screen.getByText("@lan")).toBeInTheDocument();
    expect(screen.getByText("Friends")).toBeInTheDocument();
    expect(screen.getByText("Active now")).toBeInTheDocument();
    expect(screen.getByText("Hello there")).toBeInTheDocument();
    expect(screen.getByText("lan@example.com")).toBeInTheDocument();
    // Phone is unset on the fixture: the row still renders, as a dash.
    expect(screen.getByText("Phone")).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
    expect(screen.getByText("Joined")).toBeInTheDocument();
    expect(screen.getByText("15/01/2026")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Message" })).toBeInTheDocument();
  });

  it("offers no Message action to someone who is not a friend yet", async () => {
    chatUserInfo.mockResolvedValue({
      ...LAN,
      statusFriend: FriendStatus.SENT,
    });
    renderWithProviders(
      <UserDetailDialog userId="u2" open onOpenChange={vi.fn()} />,
    );

    await screen.findByRole("heading", { name: "Lan Nguyen" });
    expect(screen.getByText("Request sent")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Message" }),
    ).not.toBeInTheDocument();
  });

  it("does not fetch while closed", () => {
    renderWithProviders(
      <UserDetailDialog userId="u2" open={false} onOpenChange={vi.fn()} />,
    );

    expect(chatUserInfo).not.toHaveBeenCalled();
  });

  it("opens from a UserItem's avatar + name", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <UserItem
        user={LAN}
        friendStatus={FriendStatus.FRIEND}
        onMessage={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Lan Nguyen/ }));

    expect(
      await screen.findByRole("heading", { name: "Lan Nguyen" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
