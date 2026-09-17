import type { Meta, StoryObj } from "@storybook/react";

import { Slider } from "@monorepo/ui/components/slider";

const meta = {
  title: "Storybook/Slider",
  component: Slider,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  argTypes: {
    disabled: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultValue: [50],
    max: 100,
    step: 1,
    disabled: false,
  },
};

export const Orientation: Story = {
  render: () => (
    <div className="flex h-40 gap-12">
      <Slider defaultValue={[50]} max={100} step={1} className="w-40" />
      <Slider orientation="vertical" defaultValue={[50]} max={100} step={1} />
    </div>
  ),
};
