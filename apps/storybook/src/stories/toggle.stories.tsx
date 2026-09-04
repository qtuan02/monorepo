import type { Meta, StoryObj } from "@storybook/react";
import { BoldIcon } from "lucide-react";

import { Toggle } from "@monorepo/ui/components/toggle";

const meta = {
  title: "Storybook/Toggle",
  component: Toggle,
  tags: ["autodocs"],
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  render: () => (
    <Toggle aria-label="Toggle bold">
      <BoldIcon />
    </Toggle>
  ),
};
