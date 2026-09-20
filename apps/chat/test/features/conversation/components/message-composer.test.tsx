import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ChatMessageRecord } from "@monorepo/types/chat-message";
import type { ChatUserProfile } from "@monorepo/types/chat-user";
import {
  ChatConversationType,
  ChatParticipantRole,
} from "@monorepo/types/chat-conversation";
import { ChatMessageType } from "@monorepo/types/chat-message";

import type { Conversation } from "~/features/conversation/types/conversation";
import MessageComposer from "~/features/conversation/components/message-composer";
import { ThemeProvider } from "~/features/layout/provider/theme-provider";
import { useAuthStore } from "~/stores/use-auth-store";

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
  chatMessageUpload,
  toastAdd,
} = vi.hoisted(() => ({
  chatUserMe: vi.fn(),
  chatMessageSendDirect: vi.fn(),
  chatMessageSendGroup: vi.fn(),
  chatMessageUpload: vi.fn(),
  toastAdd: vi.fn(),
}));

vi.mock("~/libs/http-client", () => ({
  chatUserService: { me: chatUserMe },
  chatMessageService: {
    sendDirect: chatMessageSendDirect,
    sendGroup: chatMessageSendGroup,
    upload: chatMessageUpload,
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

function renderComposer(
  conversation: Conversation,
  onSent?: (message: ChatMessageRecord) => void,
) {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <MessageComposer conversation={conversation} onSent={onSent} />
      </ThemeProvider>
    </QueryClientProvider>,
  );
}

describe("MessageComposer", () => {
  beforeEach(() => {
    useAuthStore.setState({ token: "a-token" });
    chatUserMe.mockReset().mockResolvedValue(CURRENT_USER);
    chatMessageSendDirect.mockReset();
    chatMessageSendGroup.mockReset();
    chatMessageUpload.mockReset();
    toastAdd.mockClear();
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
    renderComposer(DIRECT_CONVERSATION, onSent);

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

  describe("attachment", () => {
    // The upload input and the paperclip button share one aria-label, so a
    // selector narrows to the input — the FormData wrapping itself is
    // packages/api/test/chat/message-service.test.ts's job, not this layer's.
    function fileInput() {
      return screen.getByLabelText("Attach a file", {
        selector: "input",
      });
    }

    it("uploads a selected image and sends it as an IMAGE attachment with empty content", async () => {
      const user = userEvent.setup();
      chatMessageUpload.mockResolvedValue({
        url: "http://localhost:8089/api/files/abc.png",
        name: "abc.png",
        size: 1234,
        contentType: "image/png",
      });
      chatMessageSendDirect.mockResolvedValue({
        id: "m1",
        conversationId: "c1",
        senderId: "u1",
        content: "",
        attachmentUrl: "http://localhost:8089/api/files/abc.png",
        type: ChatMessageType.IMAGE,
        createdAt: "2026-09-20T00:00:00.000Z",
        updatedAt: "2026-09-20T00:00:00.000Z",
      });
      renderComposer(DIRECT_CONVERSATION);

      const file = new File(["binary"], "photo.png", { type: "image/png" });
      await user.upload(fileInput(), file);

      await waitFor(() => expect(chatMessageUpload).toHaveBeenCalledWith(file));

      const sendButton = await screen.findByRole("button", { name: "Send" });
      await waitFor(() => expect(sendButton).toBeEnabled());
      await user.click(sendButton);

      await waitFor(() =>
        expect(chatMessageSendDirect).toHaveBeenCalledWith({
          recipientId: "u2",
          content: "",
          type: ChatMessageType.IMAGE,
          attachmentUrl: "http://localhost:8089/api/files/abc.png",
        }),
      );
    });

    it("sends a non-image file as a FILE attachment", async () => {
      const user = userEvent.setup();
      chatMessageUpload.mockResolvedValue({
        url: "http://localhost:8089/api/files/report.pdf",
        name: "report.pdf",
        size: 2048,
        contentType: "application/pdf",
      });
      chatMessageSendDirect.mockResolvedValue({
        id: "m1",
        conversationId: "c1",
        senderId: "u1",
        content: "",
        attachmentUrl: "http://localhost:8089/api/files/report.pdf",
        type: ChatMessageType.FILE,
        createdAt: "2026-09-20T00:00:00.000Z",
        updatedAt: "2026-09-20T00:00:00.000Z",
      });
      renderComposer(DIRECT_CONVERSATION);

      const file = new File(["binary"], "report.pdf", {
        type: "application/pdf",
      });
      await user.upload(fileInput(), file);

      const sendButton = await screen.findByRole("button", { name: "Send" });
      await waitFor(() => expect(sendButton).toBeEnabled());
      await user.click(sendButton);

      await waitFor(() =>
        expect(chatMessageSendDirect).toHaveBeenCalledWith({
          recipientId: "u2",
          content: "",
          type: ChatMessageType.FILE,
          attachmentUrl: "http://localhost:8089/api/files/report.pdf",
        }),
      );
    });

    it("blocks a file over 10MB client-side, toasts, and never calls upload", async () => {
      const user = userEvent.setup();
      renderComposer(DIRECT_CONVERSATION);

      const bigFile = new File(["x"], "big.png", { type: "image/png" });
      Object.defineProperty(bigFile, "size", { value: 11 * 1024 * 1024 });
      await user.upload(fileInput(), bigFile);

      expect(chatMessageUpload).not.toHaveBeenCalled();
      expect(toastAdd).toHaveBeenCalledWith(
        expect.objectContaining({ type: "error" }),
      );
      expect(
        screen.queryByRole("button", { name: "Remove attachment" }),
      ).not.toBeInTheDocument();
    });

    it("returns Send to TEXT after removing the attachment", async () => {
      const user = userEvent.setup();
      chatMessageUpload.mockResolvedValue({
        url: "http://localhost:8089/api/files/photo.png",
        name: "photo.png",
        size: 100,
        contentType: "image/png",
      });
      renderComposer(DIRECT_CONVERSATION);

      const file = new File(["binary"], "photo.png", { type: "image/png" });
      await user.upload(fileInput(), file);
      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: "Remove attachment" }),
        ).toBeInTheDocument(),
      );

      await user.click(
        screen.getByRole("button", { name: "Remove attachment" }),
      );
      await user.type(
        screen.getByLabelText("Message composer"),
        "Hi there{Enter}",
      );

      await waitFor(() =>
        expect(chatMessageSendDirect).toHaveBeenCalledWith({
          recipientId: "u2",
          content: "Hi there",
          type: ChatMessageType.TEXT,
          attachmentUrl: null,
        }),
      );
    });

    it("ignores a stale upload response once a newer file replaced it mid-flight", async () => {
      const user = userEvent.setup();
      let resolveFirst: ((uploaded: unknown) => void) | undefined;
      let resolveSecond: ((uploaded: unknown) => void) | undefined;
      chatMessageUpload
        .mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              resolveFirst = resolve;
            }),
        )
        .mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              resolveSecond = resolve;
            }),
        );
      renderComposer(DIRECT_CONVERSATION);

      const fileA = new File(["a"], "a.png", { type: "image/png" });
      const fileB = new File(["b"], "b.pdf", { type: "application/pdf" });

      await user.upload(fileInput(), fileA);
      await waitFor(() => expect(chatMessageUpload).toHaveBeenCalledTimes(1));

      // Replaces fileA before its upload has settled — "chọn tệp khác thay
      // tệp đang có".
      await user.upload(fileInput(), fileB);
      await waitFor(() => expect(chatMessageUpload).toHaveBeenCalledTimes(2));

      // The newer upload (B) settles first.
      await act(async () => {
        resolveSecond?.({
          url: "http://localhost:8089/api/files/b.pdf",
          name: "b.pdf",
          size: 10,
          contentType: "application/pdf",
        });
      });
      expect(await screen.findByText("b.pdf")).toBeInTheDocument();

      // fileA's upload was superseded — its late response must not resurrect it.
      await act(async () => {
        resolveFirst?.({
          url: "http://localhost:8089/api/files/a.png",
          name: "a.png",
          size: 5,
          contentType: "image/png",
        });
      });
      expect(screen.getByText("b.pdf")).toBeInTheDocument();
      expect(screen.queryByText("a.png")).not.toBeInTheDocument();
    });
  });
});
