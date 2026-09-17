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

import { conversationOpener, conversationReply } from "~/support/conversation";

const meta = {
  title: "Storybook/Message",
  component: Message,
  subcomponents: { MessageGroup, MessageAvatar, MessageContent, MessageHeader },
  tags: ["autodocs"],
} satisfies Meta<typeof Message>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    controls: { disable: true },
    stage: { width: "sm" },
  },
  render: () => (
    <MessageGroup>
      <Message align="start">
        <MessageAvatar>
          <Avatar>
            <AvatarFallback>NA</AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>Northwind Assistant</MessageHeader>
          <Bubble variant="muted">
            <BubbleContent>{conversationOpener.text}</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
      <Message align="end">
        <MessageContent>
          <Bubble align="end" variant="default">
            <BubbleContent>{conversationReply.text}</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
    </MessageGroup>
  ),
};
