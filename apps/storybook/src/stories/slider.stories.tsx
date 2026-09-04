import type { Meta, StoryObj } from "@storybook/react";

import { Slider } from "@monorepo/ui/components/slider";

const meta = {
  title: "Storybook/Slider",
  component: Slider,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  render: () => (
    <Slider defaultValue={[50]} max={100} step={1} className="w-[60%]" />
  ),
};
