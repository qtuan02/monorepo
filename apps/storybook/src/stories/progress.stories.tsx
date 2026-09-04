import type { Meta, StoryObj } from "@storybook/react";

import { Progress } from "@monorepo/ui/components/progress";

const meta = {
  title: "Storybook/Progress",
  component: Progress,
  tags: ["autodocs"],
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {} as Story["args"],
  render: () => <Progress className="w-full" value={33} />,
};
