import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { FriendStatus } from "@monorepo/types/chat-friend";

import { UserItem } from "~/components/user-item";

const USER = {
  id: "u2",
  username: "lan",
  firstName: "Lan",
  lastName: "Nguyen",
  avatarUrl: null,
};

describe("UserItem", () => {
  it("shows an Add friend button for FriendStatus.NONE", () => {
    const onSendRequest = vi.fn();
    render(
      <UserItem
        user={USER}
        friendStatus={FriendStatus.NONE}
        onSendRequest={onSendRequest}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Add friend" }),
    ).toBeInTheDocument();
  });

  it("shows a Cancel request button for FriendStatus.SENT, calling back with the requestId", async () => {
    const user = userEvent.setup();
    const onCancelRequest = vi.fn();
    render(
      <UserItem
        user={USER}
        friendStatus={FriendStatus.SENT}
        requestId="r1"
        onCancelRequest={onCancelRequest}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Cancel request" }));
    expect(onCancelRequest).toHaveBeenCalledWith("r1");
  });

  it("shows a disabled Request received button for FriendStatus.RECEIVED", () => {
    render(<UserItem user={USER} friendStatus={FriendStatus.RECEIVED} />);

    expect(
      screen.getByRole("button", { name: "Request received" }),
    ).toBeDisabled();
  });

  it("shows Message and Unfriend for FriendStatus.FRIEND", () => {
    render(
      <UserItem
        user={USER}
        friendStatus={FriendStatus.FRIEND}
        onMessage={vi.fn()}
        onUnfriend={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Message" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Unfriend" }),
    ).toBeInTheDocument();
  });

  it("confirms before calling onUnfriend", async () => {
    const user = userEvent.setup();
    const onUnfriend = vi.fn();
    render(
      <UserItem
        user={USER}
        friendStatus={FriendStatus.FRIEND}
        onMessage={vi.fn()}
        onUnfriend={onUnfriend}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Unfriend" }));
    // The confirm dialog is up; onUnfriend has not fired yet.
    expect(onUnfriend).not.toHaveBeenCalled();
    expect(
      await screen.findByRole("heading", { name: "Remove Lan Nguyen?" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Remove" }));
    expect(onUnfriend).toHaveBeenCalledWith("u2");
  });

  describe("on a mobile viewport (story 51)", () => {
    it("keeps every action at a 44px touch target, back to the primitive default from md", () => {
      render(
        <UserItem
          user={USER}
          friendStatus={FriendStatus.FRIEND}
          onMessage={vi.fn()}
          onUnfriend={vi.fn()}
        />,
      );

      expect(screen.getByRole("button", { name: "Message" })).toHaveClass(
        "h-11",
        "md:h-9",
      );
      expect(screen.getByRole("button", { name: "Unfriend" })).toHaveClass(
        "h-11",
        "md:h-9",
      );
    });
  });
});
