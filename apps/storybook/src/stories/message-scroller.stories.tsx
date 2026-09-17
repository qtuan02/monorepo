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

import { northwindConversation } from "~/support/conversation";

const meta = {
  title: "Storybook/MessageScroller",
  component: MessageScroller,
  subcomponents: {
    MessageScrollerProvider,
    MessageScrollerViewport,
    MessageScrollerContent,
    MessageScrollerItem,
    MessageScrollerButton,
  },
  tags: ["autodocs"],
  parameters: { stage: { width: "sm" } },
} satisfies Meta<typeof MessageScroller>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <MessageScrollerProvider>
      <MessageScroller className="h-72 w-full rounded-lg border">
        <MessageScrollerViewport>
          <MessageScrollerContent>
            {northwindConversation.map((message) => (
              <MessageScrollerItem key={message.id} messageId={message.id}>
                <Message align={message.align}>
                  {message.align === "start" && (
                    <MessageAvatar>
                      <Avatar size="sm">
                        <AvatarFallback>NA</AvatarFallback>
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
