import type { Meta, StoryObj } from "@storybook/react";

import { Separator } from "../components/separator";

const meta = {
  title: "UI/Separator",
  component: Separator,
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
    },
    decorative: { control: "boolean" },
  },
  args: {
    orientation: "horizontal",
    decorative: true,
  },
} satisfies Meta<typeof Separator>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Horizontal: Story = {
  args: { orientation: "horizontal" },
  render: (args) => (
    <div className="w-full max-w-md space-y-2">
      <div className="text-sm">Above</div>
      <Separator {...args} />
      <div className="text-sm">Below</div>
    </div>
  ),
};

export const Vertical: Story = {
  args: { orientation: "vertical", decorative: true },
  render: (args) => (
    <div className="flex h-24 items-stretch gap-4">
      <span className="text-sm">Left</span>
      <Separator {...args} />
      <span className="text-sm">Right</span>
    </div>
  ),
};
