import type { Meta, StoryObj } from "@storybook/react";

import { Avatar, AvatarFallback } from "@monorepo/ui/components/avatar";
import { Bubble, BubbleContent } from "@monorepo/ui/components/bubble";
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@monorepo/ui/components/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@monorepo/ui/components/message-scroller";

const meta = {
  title: "Storybook/MessageScroller",
  component: MessageScroller,
  tags: ["autodocs"],
} satisfies Meta<typeof MessageScroller>;

export default meta;

type Story = StoryObj<typeof meta>;

const conversation = Array.from({ length: 12 }, (_, index) => ({
  id: `message-${index}`,
  align: index % 2 === 0 ? ("start" as const) : ("end" as const),
  text:
    index % 2 === 0
      ? `Assistant reply #${index + 1}`
      : `User question #${index + 1}`,
}));

export const Default: Story = {
  args: {},
  render: () => (
    <MessageScrollerProvider>
      <MessageScroller className="h-72 w-full max-w-sm rounded-lg border">
        <MessageScrollerViewport>
          <MessageScrollerContent>
            {conversation.map((message) => (
              <MessageScrollerItem key={message.id} messageId={message.id}>
                <Message align={message.align}>
                  {message.align === "start" && (
                    <MessageAvatar>
                      <Avatar size="sm">
                        <AvatarFallback>AI</AvatarFallback>
                      </Avatar>
                    </MessageAvatar>
                  )}
                  <MessageContent>
                    <Bubble
                      align={message.align}
                      variant={message.align === "start" ? "muted" : "default"}
                    >
                      <BubbleContent>{message.text}</BubbleContent>
                    </Bubble>
                  </MessageContent>
                </Message>
              </MessageScrollerItem>
            ))}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton direction="end" />
      </MessageScroller>
    </MessageScrollerProvider>
  ),
};
