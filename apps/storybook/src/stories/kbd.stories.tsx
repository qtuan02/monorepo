import type { Meta, StoryObj } from "@storybook/react";

import { Kbd, KbdGroup } from "@monorepo/ui/components/kbd";

const meta = {
  title: "Storybook/Kbd",
  component: Kbd,
  tags: ["autodocs"],
  argTypes: {
    children: { control: "text" },
  },
  parameters: { stage: { width: "sm" } },
} satisfies Meta<typeof Kbd>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "⌘K",
  },
};

export const Group: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <KbdGroup>
        <Kbd>⌘</Kbd>
        <Kbd>Shift</Kbd>
        <Kbd>P</Kbd>
      </KbdGroup>
      <KbdGroup>
        <Kbd>Ctrl</Kbd>
        <span className="text-muted-foreground text-xs">+</span>
        <Kbd>B</Kbd>
      </KbdGroup>
    </div>
  ),
};
