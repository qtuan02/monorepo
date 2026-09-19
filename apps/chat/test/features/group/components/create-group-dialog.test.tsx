import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ChatConversationRecord } from "@monorepo/types/chat-conversation";
import { ChatConversationType, ChatParticipantRole } from "@monorepo/types/chat-conversation";

import { CreateGroupDialog } from "~/features/group/components/create-group-dialog";

const { chatFriendList, chatConversationCreateGroup } = vi.hoisted(() => ({
  chatFriendList: vi.fn(),
  chatConversationCreateGroup: vi.fn(),
}));

vi.mock("~/libs/http-client", () => ({
  chatFriendService: { list: chatFriendList },
  chatConversationService: { createGroup: chatConversationCreateGroup },
}));

const GROUP: ChatConversationRecord = {
  id: "c9",
  type: ChatConversationType.GROUP,
  groupName: "Team Alpha",
  lastMessage: null,
  lastMessageAt: null,
  unreadCount: 0,
  participants: [
    { userId: "u1", firstName: "Tuan", lastName: "Huynh", role: ChatParticipantRole.ADMIN },
    { userId: "u2", firstName: "Lan", lastName: "Nguyen", role: ChatParticipantRole.MEMBER },
  ],
};

function renderDialog(onCreated: (conversationId: string) => void = vi.fn()) {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <CreateGroupDialog open onOpenChange={vi.fn()} onCreated={onCreated} />
    </QueryClientProvider>,
  );
}

describe("CreateGroupDialog", () => {
  beforeEach(() => {
    chatFriendList.mockReset().mockResolvedValue({
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
    chatConversationCreateGroup.mockReset().mockResolvedValue(GROUP);
  });

  it("keeps the Create button disabled until a member is selected — driven by useWatch", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.type(screen.getByLabelText("Group name"), "Team Alpha");
    expect(screen.getByRole("button", { name: "Create" })).toBeDisabled();

    await user.click(await screen.findByRole("button", { name: "Add Lan Nguyen" }));

    expect(
      await screen.findByRole("button", { name: "Create (1)" }),
    ).toBeEnabled();
  });

  it("submits with the selected memberIds once enabled", async () => {
    const user = userEvent.setup();
    const onCreated = vi.fn();
    renderDialog(onCreated);

    await user.type(screen.getByLabelText("Group name"), "Team Alpha");
    await user.click(await screen.findByRole("button", { name: "Add Lan Nguyen" }));
    await user.click(await screen.findByRole("button", { name: "Create (1)" }));

    await waitFor(() =>
      expect(chatConversationCreateGroup).toHaveBeenCalledWith({
        type: "GROUP",
        name: "Team Alpha",
        memberIds: ["u2"],
      }),
    );
    await waitFor(() => expect(onCreated).toHaveBeenCalledWith("c9"));
  });
});
