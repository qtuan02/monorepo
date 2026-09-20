import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ChatParticipantRole } from "@monorepo/types/chat-conversation";
import { ChatMessageType } from "@monorepo/types/chat-message";

import type { ConversationMember } from "~/features/conversation/types/conversation";
import type { Message } from "~/features/conversation/types/message";
import type { MessagePosition } from "~/features/conversation/utils/group-messages";
import MessageRow from "~/features/conversation/components/message-row";
import { groupMessages } from "~/features/conversation/utils/group-messages";

const { chatMessageDelete } = vi.hoisted(() => ({
  chatMessageDelete: vi.fn(),
}));

vi.mock("~/libs/http-client", () => ({
  chatMessageService: { deleteMessage: chatMessageDelete },
}));

const CURRENT_USER_ID = "u1";

function message(overrides: Partial<Message> & Pick<Message, "id">): Message {
  return {
    conversationId: "c1",
    senderId: "u2",
    senderName: "Lan Nguyen",
    content: "hi",
    type: ChatMessageType.TEXT,
    createdAt: "2026-09-16T08:00:00.000Z",
    updatedAt: "2026-09-16T08:00:00.000Z",
    ...overrides,
  };
}

function reader(
  overrides: Partial<ConversationMember> & Pick<ConversationMember, "userId">,
): ConversationMember {
  return {
    displayName: "Someone",
    role: ChatParticipantRole.MEMBER,
    ...overrides,
  };
}

function renderThread(messages: Message[]) {
  const positions = groupMessages(messages, CURRENT_USER_ID);
  const queryClient = new QueryClient();
  render(
    <QueryClientProvider client={queryClient}>
      <div data-testid="thread">
        {positions.map((position) => (
          <MessageRow key={position.message.id} position={position} />
        ))}
      </div>
    </QueryClientProvider>,
  );
  return within(screen.getByTestId("thread"));
}

function renderPosition(
  position: MessagePosition,
  props: Partial<
    Pick<Parameters<typeof MessageRow>[0], "readers" | "seenByOther" | "onEdit">
  > = {},
) {
  const queryClient = new QueryClient();
  render(
    <QueryClientProvider client={queryClient}>
      <div data-testid="row">
        <MessageRow position={position} {...props} />
      </div>
    </QueryClientProvider>,
  );
  return within(screen.getByTestId("row"));
}

describe("MessageRow", () => {
  beforeEach(() => {
    chatMessageDelete.mockReset().mockResolvedValue(undefined);
  });

  it("renders the sender's name once and the time once, on a three-message run", () => {
    const thread = renderThread([
      message({
        id: "m1",
        content: "one",
        createdAt: "2026-09-16T08:00:00.000Z",
      }),
      message({
        id: "m2",
        content: "two",
        createdAt: "2026-09-16T08:02:00.000Z",
      }),
      message({
        id: "m3",
        content: "three",
        createdAt: "2026-09-16T08:04:00.000Z",
      }),
    ]);

    expect(thread.getAllByText("Lan Nguyen")).toHaveLength(1);
    expect(thread.getByText("one")).toBeInTheDocument();
    expect(thread.getByText("two")).toBeInTheDocument();
    expect(thread.getByText("three")).toBeInTheDocument();
    // The time renders once, on the last message of the run.
    expect(thread.getAllByText("08:04")).toHaveLength(1);
    expect(thread.queryByText("08:00")).not.toBeInTheDocument();
    expect(thread.queryByText("08:02")).not.toBeInTheDocument();
  });

  it("renders no avatar or sender name for the signed-in visitor's own messages", () => {
    const thread = renderThread([
      message({
        id: "m1",
        senderId: CURRENT_USER_ID,
        senderName: "Tuan Huynh",
      }),
    ]);

    expect(thread.queryByText("Tuan Huynh")).not.toBeInTheDocument();
  });

  it("renders a SYSTEM message as a standalone pill, not a bubble, and keeps it out of the neighboring group", () => {
    const thread = renderThread([
      message({ id: "m1", content: "Hey there" }),
      message({
        id: "m2",
        type: ChatMessageType.SYSTEM,
        senderId: "u3",
        content: "Minh joined the group",
        createdAt: "2026-09-16T08:01:00.000Z",
      }),
      message({
        id: "m3",
        content: "Welcome!",
        createdAt: "2026-09-16T08:02:00.000Z",
      }),
    ]);

    expect(thread.getByText("Minh joined the group")).toBeInTheDocument();
    // A SYSTEM entry starts and ends its own run: the sender name renders
    // again right after it, proving the bubble run before it did not swallow it.
    expect(thread.getAllByText("Lan Nguyen")).toHaveLength(2);
  });

  describe("read receipt", () => {
    function ownLastMessagePosition(): MessagePosition {
      const [position] = groupMessages(
        [message({ id: "m1", senderId: CURRENT_USER_ID })],
        CURRENT_USER_ID,
      );
      if (!position) throw new Error("expected one grouped message");
      return position;
    }

    it("shows 'Seen' on the visitor's own last message once the other has read it", () => {
      const row = renderPosition(ownLastMessagePosition(), {
        seenByOther: true,
      });

      expect(row.getByRole("img", { name: "Seen" })).toBeInTheDocument();
    });

    it("shows no 'Seen' text while the other hasn't read it yet", () => {
      const row = renderPosition(ownLastMessagePosition(), {
        seenByOther: false,
      });

      expect(row.queryByRole("img", { name: "Seen" })).not.toBeInTheDocument();
    });

    it("renders a reader's avatar under the message their read receipt names", () => {
      const row = renderPosition(ownLastMessagePosition(), {
        readers: [reader({ userId: "u2", displayName: "Lan Nguyen" })],
      });

      expect(row.getByText("LN")).toBeInTheDocument();
    });

    it("renders no reader avatars when nobody's frontier is this message", () => {
      const row = renderPosition(ownLastMessagePosition(), { readers: [] });

      expect(row.queryByText("LN")).not.toBeInTheDocument();
    });

    it("caps the visible stack at 3 avatars and folds the rest into '+n'", () => {
      const readers = [
        reader({ userId: "u2", displayName: "Lan Nguyen" }),
        reader({ userId: "u3", displayName: "Minh Tran" }),
        reader({ userId: "u4", displayName: "An Le" }),
        reader({ userId: "u5", displayName: "Bao Vo" }),
      ];
      const row = renderPosition(ownLastMessagePosition(), { readers });

      expect(row.getByText("LN")).toBeInTheDocument();
      expect(row.getByText("MT")).toBeInTheDocument();
      expect(row.getByText("AL")).toBeInTheDocument();
      expect(row.queryByText("BV")).not.toBeInTheDocument();
      expect(row.getByText("+1")).toBeInTheDocument();
    });
  });

  describe("edit / delete actions (T3, spec #253)", () => {
    function ownTextPosition(overrides: Partial<Message> = {}): MessagePosition {
      const [position] = groupMessages(
        [message({ id: "m1", senderId: CURRENT_USER_ID, ...overrides })],
        CURRENT_USER_ID,
      );
      if (!position) throw new Error("expected one grouped message");
      return position;
    }

    it("shows the ⋯ menu on the visitor's own message", () => {
      const own = renderPosition(ownTextPosition());
      expect(
        own.getByRole("button", { name: "Message actions" }),
      ).toBeInTheDocument();
    });

    it("hides the ⋯ menu on someone else's message", () => {
      const otherPosition = groupMessages(
        [message({ id: "m2" })],
        CURRENT_USER_ID,
      )[0];
      if (!otherPosition) throw new Error("expected one grouped message");

      const other = renderPosition(otherPosition);
      expect(
        other.queryByRole("button", { name: "Message actions" }),
      ).not.toBeInTheDocument();
    });

    it("offers 'Edit' for a TEXT message and calls onEdit with it", async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();
      const row = renderPosition(ownTextPosition({ type: ChatMessageType.TEXT }), {
        onEdit,
      });

      await user.click(row.getByRole("button", { name: "Message actions" }));
      fireEvent.click(await screen.findByRole("menuitem", { name: "Edit" }));

      expect(onEdit).toHaveBeenCalledWith(
        expect.objectContaining({ id: "m1" }),
      );
    });

    it("hides 'Edit' for a non-TEXT message, and still offers 'Delete'", async () => {
      const user = userEvent.setup();
      const row = renderPosition(ownTextPosition({ type: ChatMessageType.IMAGE }));

      await user.click(row.getByRole("button", { name: "Message actions" }));

      expect(
        await screen.findByRole("menuitem", { name: "Delete" }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("menuitem", { name: "Edit" }),
      ).not.toBeInTheDocument();
    });

    it("asks for confirmation before deleting, and only deletes on confirm", async () => {
      const user = userEvent.setup();
      const row = renderPosition(ownTextPosition());

      await user.click(row.getByRole("button", { name: "Message actions" }));
      fireEvent.click(await screen.findByRole("menuitem", { name: "Delete" }));

      const dialog = screen.getByRole("alertdialog");
      expect(chatMessageDelete).not.toHaveBeenCalled();

      await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
      expect(chatMessageDelete).not.toHaveBeenCalled();

      await user.click(row.getByRole("button", { name: "Message actions" }));
      fireEvent.click(await screen.findByRole("menuitem", { name: "Delete" }));
      await user.click(
        within(screen.getByRole("alertdialog")).getByRole("button", {
          name: "Delete",
        }),
      );

      await waitFor(() =>
        expect(chatMessageDelete).toHaveBeenCalledWith("m1"),
      );
    });

    it("shows '(edited)' once updatedAt differs from createdAt", () => {
      const edited = renderPosition(
        ownTextPosition({
          createdAt: "2026-09-16T08:00:00.000Z",
          updatedAt: "2026-09-16T08:05:00.000Z",
        }),
      );
      expect(edited.getByText("(edited)")).toBeInTheDocument();
    });

    it("shows no '(edited)' when updatedAt equals createdAt", () => {
      const unedited = renderPosition(
        ownTextPosition({
          createdAt: "2026-09-16T08:00:00.000Z",
          updatedAt: "2026-09-16T08:00:00.000Z",
        }),
      );
      expect(unedited.queryByText("(edited)")).not.toBeInTheDocument();
    });
  });
});
