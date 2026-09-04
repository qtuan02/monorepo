import type { Meta, StoryObj } from "@storybook/react";

import { Avatar, AvatarFallback } from "@monorepo/ui/components/avatar";
import { Bubble, BubbleContent } from "@monorepo/ui/components/bubble";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageGroup,
  MessageHeader,
} from "@monorepo/ui/components/message";

const meta = {
  title: "Storybook/Message",
  component: Message,
  tags: ["autodocs"],
} satisfies Meta<typeof Message>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  render: () => (
    <MessageGroup className="max-w-sm">
      <Message align="start">
        <MessageAvatar>
          <Avatar>
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>Assistant</MessageHeader>
          <Bubble variant="muted">
            <BubbleContent>Hi, how can I help you today?</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
      <Message align="end">
        <MessageContent>
          <Bubble align="end" variant="default">
            <BubbleContent>I need help resetting my password.</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
    </MessageGroup>
  ),
};
