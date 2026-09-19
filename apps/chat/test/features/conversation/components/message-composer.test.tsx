import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
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
import { useAuthStore } from "~/stores/use-auth-store";

const CURRENT_USER: ChatUserProfile = {
  id: "u1",
  username: "tuanhq02",
  firstName: "Tuan",
  lastName: "Huynh",
};

const { chatUserMe, chatMessageSendDirect, chatMessageSendGroup } = vi.hoisted(
  () => ({
    chatUserMe: vi.fn(),
    chatMessageSendDirect: vi.fn(),
    chatMessageSendGroup: vi.fn(),
  }),
);

vi.mock("~/libs/http-client", () => ({
  chatUserService: { me: chatUserMe },
  chatMessageService: {
    sendDirect: chatMessageSendDirect,
    sendGroup: chatMessageSendGroup,
  },
  chatConversationService: {
    getConversations: vi
      .fn()
      .mockResolvedValue({ items: [], nextCursor: null }),
  },
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
      <MessageComposer conversation={conversation} onSent={onSent} />
    </QueryClientProvider>,
  );
}

describe("MessageComposer", () => {
  beforeEach(() => {
    useAuthStore.setState({ token: "a-token" });
    chatUserMe.mockReset().mockResolvedValue(CURRENT_USER);
    chatMessageSendDirect.mockReset();
    chatMessageSendGroup.mockReset();
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
});
