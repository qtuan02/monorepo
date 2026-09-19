import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { FriendRequestRow } from "~/features/friends/components/friend-request-row";

const REQUEST_USER = {
  id: "u3",
  username: "minh",
  firstName: "Minh",
  lastName: "Tran",
  avatarUrl: null,
};

describe("FriendRequestRow", () => {
  it("calls onAccept/onDecline with the requestId for a received request", async () => {
    const user = userEvent.setup();
    const onAccept = vi.fn();
    const onDecline = vi.fn();
    render(
      <FriendRequestRow
        requestId="r1"
        requestUser={REQUEST_USER}
        variant="received"
        isProcessing={false}
        onAccept={onAccept}
        onDecline={onDecline}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Accept friend request" }),
    );
    expect(onAccept).toHaveBeenCalledWith("r1");

    await user.click(
      screen.getByRole("button", { name: "Decline friend request" }),
    );
    expect(onDecline).toHaveBeenCalledWith("r1");
  });

  it("calls onCancel with the requestId for a sent request", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <FriendRequestRow
        requestId="r2"
        requestUser={REQUEST_USER}
        variant="sent"
        isProcessing={false}
        onCancel={onCancel}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Cancel friend request" }),
    );
    expect(onCancel).toHaveBeenCalledWith("r2");
  });

  // Story 52 — Decline is never destructive: declining isn't the
  // irreversible action Unfriend/Leave keep their red confirm dialog for.
  it("renders Decline as an outline button, never destructive", () => {
    render(
      <FriendRequestRow
        requestId="r1"
        requestUser={REQUEST_USER}
        variant="received"
        isProcessing={false}
        onAccept={vi.fn()}
        onDecline={vi.fn()}
      />,
    );

    const decline = screen.getByRole("button", {
      name: "Decline friend request",
    });
    expect(decline).not.toHaveClass("bg-destructive/10");
  });

  describe("on a mobile viewport (story 51)", () => {
    it("keeps Accept/Decline/Cancel at a 44px touch target, back to the primitive default from md", () => {
      render(
        <FriendRequestRow
          requestId="r1"
          requestUser={REQUEST_USER}
          variant="received"
          isProcessing={false}
          onAccept={vi.fn()}
          onDecline={vi.fn()}
        />,
      );

      expect(
        screen.getByRole("button", { name: "Accept friend request" }),
      ).toHaveClass("size-11", "md:size-8");
      expect(
        screen.getByRole("button", { name: "Decline friend request" }),
      ).toHaveClass("size-11", "md:size-8");
    });
  });
});
