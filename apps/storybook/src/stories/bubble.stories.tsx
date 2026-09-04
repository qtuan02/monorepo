import type { Meta, StoryObj } from "@storybook/react";
import { ThumbsUpIcon } from "lucide-react";

import {
  Bubble,
  BubbleContent,
  BubbleGroup,
  BubbleReactions,
} from "@monorepo/ui/components/bubble";

const meta = {
  title: "Storybook/Bubble",
  component: Bubble,
  tags: ["autodocs"],
} satisfies Meta<typeof Bubble>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  render: () => (
    <BubbleGroup className="max-w-sm">
      <Bubble align="start" variant="muted">
        <BubbleContent>Hi, how can I help you today?</BubbleContent>
      </Bubble>
      <Bubble align="end" variant="default">
        <BubbleContent>I need help resetting my password.</BubbleContent>
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
  args: {},
  render: () => (
    <BubbleGroup className="max-w-sm">
      {variants.map((variant) => (
        <Bubble key={variant} variant={variant}>
          <BubbleContent className="capitalize">{variant}</BubbleContent>
        </Bubble>
      ))}
    </BubbleGroup>
  ),
};

export const WithReactions: Story = {
  args: {},
  render: () => (
    <Bubble align="start" variant="muted" className="max-w-sm">
      <BubbleContent>Great work on the release! 🎉</BubbleContent>
      <BubbleReactions>
        <ThumbsUpIcon className="size-3.5" />
        <span>3</span>
      </BubbleReactions>
    </Bubble>
  ),
};
