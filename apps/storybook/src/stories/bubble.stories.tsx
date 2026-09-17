import type { Meta, StoryObj } from "@storybook/react";
import { ThumbsUpIcon } from "lucide-react";

import {
  Bubble,
  BubbleContent,
  BubbleGroup,
  BubbleReactions,
} from "@monorepo/ui/components/bubble";

import { conversationOpener, conversationReply } from "~/support/conversation";

const meta = {
  title: "Storybook/Bubble",
  component: Bubble,
  subcomponents: { BubbleGroup, BubbleContent, BubbleReactions },
  tags: ["autodocs"],
  parameters: { stage: { width: "sm" } },
} satisfies Meta<typeof Bubble>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <BubbleGroup>
      <Bubble align="start" variant="muted">
        <BubbleContent>{conversationOpener.text}</BubbleContent>
      </Bubble>
      <Bubble align="end" variant="default">
        <BubbleContent>{conversationReply.text}</BubbleContent>
      </Bubble>
    </BubbleGroup>
  ),
};

const variants = [
  "default",
  "secondary",
  "muted",
  "tinted",
  "outline",
  "ghost",
  "destructive",
] as const;

export const Variants: Story = {
  render: () => (
    <BubbleGroup>
      {variants.map((variant) => (
        <Bubble key={variant} variant={variant}>
          <BubbleContent className="capitalize">{variant}</BubbleContent>
        </Bubble>
      ))}
    </BubbleGroup>
  ),
};

export const WithReactions: Story = {
  render: () => (
    <Bubble align="start" variant="muted">
      <BubbleContent>
        Sent the INV-2041 receipt to finance@northwind.dev 🎉
      </BubbleContent>
      <BubbleReactions>
        <ThumbsUpIcon className="size-3.5" />
        <span>3</span>
      </BubbleReactions>
    </Bubble>
  ),
};
