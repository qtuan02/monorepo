import type { Client } from "@stomp/stompjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ChatMessageRecord } from "@monorepo/types/chat-message";
import type { ChatUserProfile } from "@monorepo/types/chat-user";
import {
  ChatConversationType,
  ChatParticipantRole,
} from "@monorepo/types/chat-conversation";
import { ChatMessageType } from "@monorepo/types/chat-message";

import type { Conversation } from "~/features/conversation/types/conversation";
import type { Message } from "~/features/conversation/types/message";
import MessageComposer from "~/features/conversation/components/message-composer";
import { ThemeProvider } from "~/features/layout/provider/theme-provider";
import { useAuthStore } from "~/stores/use-auth-store";
import { useSocketStore } from "~/stores/use-socket-store";

const CURRENT_USER: ChatUserProfile = {
  id: "u1",
  username: "tuanhq02",
  firstName: "Tuan",
  lastName: "Huynh",
};

const {
  chatUserMe,
  chatMessageSendDirect,
  chatMessageSendGroup,
  toastAdd,
  sendTyping,
  chatMessageUpdate,
} = vi.hoisted(() => ({
  chatUserMe: vi.fn(),
  chatMessageSendDirect: vi.fn(),
  chatMessageSendGroup: vi.fn(),
  toastAdd: vi.fn(),
  sendTyping: vi.fn(),
  chatMessageUpdate: vi.fn(),
}));

vi.mock("~/libs/http-client", () => ({
  chatUserService: { me: chatUserMe },
  chatMessageService: {
    sendDirect: chatMessageSendDirect,
    sendGroup: chatMessageSendGroup,
    updateMessage: chatMessageUpdate,
  },
  chatConversationService: {
    getConversations: vi
      .fn()
      .mockResolvedValue({ items: [], nextCursor: null }),
  },
}));

vi.mock("@monorepo/ui/components/toast", () => ({
  toast: { add: toastAdd },
}));

// `useMessageComposer` calls this directly on every onChange throttled to
// ~2s — the pane's own subscribeToTyping lives one level up, in
// ConversationPanel (see use-typing-indicator.test.ts), so it needs no
// stubbing here.
vi.mock("~/libs/socket", () => ({ sendTyping }));

const DIRECT_CONVERSATION: Conversation = {
  id: "c1",
  type: ChatConversationType.DIRECT,
  title: "Lan Nguyen",
  lastMessage: "No messages yet.",
  lastMessageAt: null,
  unreadCount: 0,
  currentUserId: "u1",
  members: [
    {
      userId: "u1",
      displayName: "Tuan Huynh",
      role: ChatParticipantRole.MEMBER,
    },
    {
      userId: "u2",
      displayName: "Lan Nguyen",
      role: ChatParticipantRole.MEMBER,
    },
  ],
};

const GROUP_CONVERSATION: Conversation = {
  ...DIRECT_CONVERSATION,
  type: ChatConversationType.GROUP,
  title: "Weekend trip",
};

interface RenderComposerOptions {
  onSent?: (message: ChatMessageRecord) => void;
  editingMessage?: Message | null;
  onCancelEdit?: () => void;
  typingUserIds?: string[];
}

function renderComposer(
  conversation: Conversation,
  options: RenderComposerOptions = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  const tree = (opts: RenderComposerOptions) => (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <MessageComposer
          conversation={conversation}
          onSent={opts.onSent}
          editingMessage={opts.editingMessage}
          onCancelEdit={opts.onCancelEdit}
          typingUserIds={opts.typingUserIds ?? []}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
  const result = render(tree(options));
  return {
    ...result,
    // Re-renders the SAME tree with new props — how a real prop change from
    // ConversationPanel (opening/closing edit mode) reaches this component,
    // as opposed to a fresh `render()` which would mount a second instance.
    rerenderWith: (nextOptions: RenderComposerOptions) =>
      result.rerender(tree(nextOptions)),
  };
}

const EDITING_MESSAGE: Message = {
  id: "m1",
  conversationId: "c1",
  senderId: "u1",
  senderName: "Tuan Huynh",
  content: "Original text",
  attachmentUrl: null,
  type: ChatMessageType.TEXT,
  createdAt: "2026-09-20T00:00:00.000Z",
  updatedAt: "2026-09-20T00:00:00.000Z",
};

describe("MessageComposer", () => {
  beforeEach(() => {
    useAuthStore.setState({ token: "a-token" });
    chatUserMe.mockReset().mockResolvedValue(CURRENT_USER);
    chatMessageSendDirect.mockReset();
    chatMessageSendGroup.mockReset();
    toastAdd.mockClear();
    chatMessageUpdate.mockReset();
  });

  afterEach(() => {
    useSocketStore.setState({ client: null, isConnected: false });
  });

  it("sends a direct message to the other member on Enter, and clears the textarea", async () => {
    const user = userEvent.setup();
    chatMessageSendDirect.mockResolvedValue({
      id: "m1",
      conversationId: "c1",
      senderId: "u1",
      content: "Hi there",
      type: ChatMessageType.TEXT,
      createdAt: "2026-09-19T00:00:00.000Z",
      updatedAt: "2026-09-19T00:00:00.000Z",
    });
    renderComposer(DIRECT_CONVERSATION);

    const textarea = screen.getByLabelText("Message composer");
    await user.type(textarea, "Hi there{Enter}");

    await waitFor(() =>
      expect(chatMessageSendDirect).toHaveBeenCalledWith({
        recipientId: "u2",
        content: "Hi there",
        type: ChatMessageType.TEXT,
        attachmentUrl: null,
      }),
    );
    expect(textarea).toHaveValue("");
  });

  it("sends a group message with the conversation id on Enter", async () => {
    const user = userEvent.setup();
    chatMessageSendGroup.mockResolvedValue({
      id: "m1",
      conversationId: "c1",
      senderId: "u1",
      content: "Hi all",
      type: ChatMessageType.TEXT,
      createdAt: "2026-09-19T00:00:00.000Z",
      updatedAt: "2026-09-19T00:00:00.000Z",
    });
    renderComposer(GROUP_CONVERSATION);

    await user.type(screen.getByLabelText("Message composer"), "Hi all{Enter}");

    await waitFor(() =>
      expect(chatMessageSendGroup).toHaveBeenCalledWith({
        conversationId: "c1",
        content: "Hi all",
        type: ChatMessageType.TEXT,
        attachmentUrl: null,
      }),
    );
  });

  it("does not add a newline and does not submit on Shift+Enter", async () => {
    const user = userEvent.setup();
    renderComposer(DIRECT_CONVERSATION);

    const textarea = screen.getByLabelText("Message composer");
    await user.type(textarea, "line one{Shift>}{Enter}{/Shift}line two");

    expect(textarea).toHaveValue("line one\nline two");
    expect(chatMessageSendDirect).not.toHaveBeenCalled();
  });

  it("calls the service only once when Enter is pressed twice before the mutation settles", async () => {
    const user = userEvent.setup();
    let resolveSend: (() => void) | undefined;
    chatMessageSendDirect.mockReturnValue(
      new Promise((resolve) => {
        resolveSend = () =>
          resolve({
            id: "m1",
            conversationId: "c1",
            senderId: "u1",
            content: "Hi there",
            type: ChatMessageType.TEXT,
            createdAt: "2026-09-19T00:00:00.000Z",
            updatedAt: "2026-09-19T00:00:00.000Z",
          });
      }),
    );
    renderComposer(DIRECT_CONVERSATION);

    const textarea = screen.getByLabelText("Message composer");
    await user.type(textarea, "Hi there");
    await user.keyboard("{Enter}{Enter}");

    expect(chatMessageSendDirect).toHaveBeenCalledTimes(1);
    resolveSend?.();
    await waitFor(() => expect(textarea).toHaveValue(""));
  });

  it("calls onSent with the sent message once the mutation resolves", async () => {
    const user = userEvent.setup();
    const message: ChatMessageRecord = {
      id: "m1",
      conversationId: "c1",
      senderId: "u1",
      content: "Hi there",
      type: ChatMessageType.TEXT,
      createdAt: "2026-09-19T00:00:00.000Z",
      updatedAt: "2026-09-19T00:00:00.000Z",
    };
    chatMessageSendDirect.mockResolvedValue(message);
    const onSent = vi.fn();
    renderComposer(DIRECT_CONVERSATION, { onSent });

    await user.type(
      screen.getByLabelText("Message composer"),
      "Hi there{Enter}",
    );

    await waitFor(() => expect(onSent).toHaveBeenCalledWith(message));
  });

  it("restores the composer's content when the mutation rejects", async () => {
    const user = userEvent.setup();
    chatMessageSendDirect.mockRejectedValue(new Error("network down"));
    renderComposer(DIRECT_CONVERSATION);

    const textarea = screen.getByLabelText("Message composer");
    await user.type(textarea, "Hi there{Enter}");

    await waitFor(() => expect(chatMessageSendDirect).toHaveBeenCalled());
    await waitFor(() => expect(textarea).toHaveValue("Hi there"));
  });

  it("disables Send while the textarea is empty, and enables it once there is text", async () => {
    const user = userEvent.setup();
    renderComposer(DIRECT_CONVERSATION);

    const sendButton = screen.getByRole("button", { name: "Send" });
    expect(sendButton).toBeDisabled();

    await user.type(screen.getByLabelText("Message composer"), "Hi there");
    expect(sendButton).toBeEnabled();

    await user.clear(screen.getByLabelText("Message composer"));
    expect(sendButton).toBeDisabled();
  });

  it("shows a Spinner on Send while the mutation is pending", async () => {
    const user = userEvent.setup();
    let resolveSend: (() => void) | undefined;
    chatMessageSendDirect.mockReturnValue(
      new Promise((resolve) => {
        resolveSend = () =>
          resolve({
            id: "m1",
            conversationId: "c1",
            senderId: "u1",
            content: "Hi there",
            type: ChatMessageType.TEXT,
            createdAt: "2026-09-19T00:00:00.000Z",
            updatedAt: "2026-09-19T00:00:00.000Z",
          });
      }),
    );
    renderComposer(DIRECT_CONVERSATION);

    await user.type(
      screen.getByLabelText("Message composer"),
      "Hi there{Enter}",
    );

    expect(
      await screen.findByRole("button", { name: "Sending..." }),
    ).toBeInTheDocument();
    expect(document.querySelector('[data-slot="spinner"]')).toBeInTheDocument();

    resolveSend?.();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Send" })).toBeInTheDocument(),
    );
  });

  describe("typing", () => {
    beforeEach(() => {
      useSocketStore.setState({ client: {} as Client, isConnected: true });
    });

    it("throttles sendTyping to ~once every 2s while typing continuously", () => {
      vi.useFakeTimers();
      try {
        renderComposer(DIRECT_CONVERSATION);
        const textarea = screen.getByLabelText("Message composer");

        for (const value of ["H", "Hi", "Hi ", "Hi t", "Hi th", "Hi the"]) {
          fireEvent.change(textarea, { target: { value } });
          vi.advanceTimersByTime(1000);
        }

        expect(sendTyping).toHaveBeenCalledTimes(3);
        expect(sendTyping).toHaveBeenCalledWith({}, "c1");
      } finally {
        vi.useRealTimers();
      }
    });

    it("does not send typing once the textarea is cleared back to empty", () => {
      renderComposer(DIRECT_CONVERSATION);
      const textarea = screen.getByLabelText("Message composer");

      fireEvent.change(textarea, { target: { value: "Hi" } });
      expect(sendTyping).toHaveBeenCalledTimes(1);

      fireEvent.change(textarea, { target: { value: "" } });
      expect(sendTyping).toHaveBeenCalledTimes(1);
    });

    // `typingUserIds` arrives resolved from `ConversationPanel`'s
    // `useTypingIndicator` (see use-typing-indicator.test.ts for the
    // show/hide/reset/merge/own-id behaviour) — the composer's own job is
    // resolving those ids to display names and rendering (or hiding) the line.
    it('renders "X is typing…" for one typing userId', () => {
      renderComposer(DIRECT_CONVERSATION, { typingUserIds: ["u2"] });

      expect(screen.getByText("Lan Nguyen is typing…")).toBeInTheDocument();
    });

    it('joins several typing userIds as "A, B are typing…"', () => {
      const group: Conversation = {
        ...GROUP_CONVERSATION,
        members: [
          ...GROUP_CONVERSATION.members,
          {
            userId: "u3",
            displayName: "Minh Tran",
            role: ChatParticipantRole.MEMBER,
          },
        ],
      };
      renderComposer(group, { typingUserIds: ["u2", "u3"] });

      expect(
        screen.getByText("Lan Nguyen, Minh Tran are typing…"),
      ).toBeInTheDocument();
    });

    it("renders no typing line when nobody is typing", () => {
      renderComposer(DIRECT_CONVERSATION, { typingUserIds: [] });

      expect(
        screen.queryByText(/is typing…|are typing…/),
      ).not.toBeInTheDocument();
    });
  });

  describe("edit mode (T3, spec #253)", () => {
    it("shows the editing banner and the message's own text in the textarea", () => {
      renderComposer(DIRECT_CONVERSATION, { editingMessage: EDITING_MESSAGE });

      expect(screen.getByText("Editing message")).toBeInTheDocument();
      expect(screen.getByLabelText("Message composer")).toHaveValue(
        "Original text",
      );
    });

    it("Enter calls updateMessage, not send, and does not call onSent", async () => {
      const user = userEvent.setup();
      const onSent = vi.fn();
      const onCancelEdit = vi.fn();
      chatMessageUpdate.mockResolvedValue({
        ...EDITING_MESSAGE,
        content: "Edited text",
        updatedAt: "2026-09-20T00:05:00.000Z",
      });
      renderComposer(DIRECT_CONVERSATION, {
        editingMessage: EDITING_MESSAGE,
        onCancelEdit,
        onSent,
      });

      const textarea = screen.getByLabelText("Message composer");
      await user.clear(textarea);
      await user.type(textarea, "Edited text{Enter}");

      await waitFor(() =>
        expect(chatMessageUpdate).toHaveBeenCalledWith("m1", {
          content: "Edited text",
        }),
      );
      expect(chatMessageSendDirect).not.toHaveBeenCalled();
      expect(onSent).not.toHaveBeenCalled();
      await waitFor(() => expect(onCancelEdit).toHaveBeenCalled());
    });

    it("Huỷ exits edit mode without saving, and restores the prior draft", async () => {
      const user = userEvent.setup();
      const onCancelEdit = vi.fn();
      const { rerenderWith } = renderComposer(DIRECT_CONVERSATION, {
        onCancelEdit,
      });

      // A draft the visitor already had before opening edit mode.
      await user.type(screen.getByLabelText("Message composer"), "My draft");

      rerenderWith({ editingMessage: EDITING_MESSAGE, onCancelEdit });
      expect(screen.getByLabelText("Message composer")).toHaveValue(
        "Original text",
      );

      await user.click(screen.getByRole("button", { name: "Cancel" }));
      expect(onCancelEdit).toHaveBeenCalled();
      expect(chatMessageUpdate).not.toHaveBeenCalled();

      // The parent (ConversationPanel) clears its own editingMessage state.
      rerenderWith({ onCancelEdit });
      expect(screen.getByLabelText("Message composer")).toHaveValue("My draft");
    });

    it("Escape exits edit mode without saving", async () => {
      const user = userEvent.setup();
      const onCancelEdit = vi.fn();
      renderComposer(DIRECT_CONVERSATION, {
        editingMessage: EDITING_MESSAGE,
        onCancelEdit,
      });

      await user.type(screen.getByLabelText("Message composer"), "{Escape}");

      expect(onCancelEdit).toHaveBeenCalled();
      expect(chatMessageUpdate).not.toHaveBeenCalled();
    });

    it("switching straight from editing one message to another keeps the ORIGINAL draft, not the half-edited text", async () => {
      const user = userEvent.setup();
      const onCancelEdit = vi.fn();
      const otherMessage: Message = {
        ...EDITING_MESSAGE,
        id: "m2",
        content: "Another message",
      };
      const { rerenderWith } = renderComposer(DIRECT_CONVERSATION, {
        onCancelEdit,
      });

      await user.type(screen.getByLabelText("Message composer"), "My draft");

      rerenderWith({ editingMessage: EDITING_MESSAGE, onCancelEdit });
      await user.clear(screen.getByLabelText("Message composer"));
      await user.type(screen.getByLabelText("Message composer"), "half-edited");

      // Switch the edit target without exiting edit mode first.
      rerenderWith({ editingMessage: otherMessage, onCancelEdit });
      expect(screen.getByLabelText("Message composer")).toHaveValue(
        "Another message",
      );

      rerenderWith({ onCancelEdit });
      expect(screen.getByLabelText("Message composer")).toHaveValue("My draft");
    });
  });
});
