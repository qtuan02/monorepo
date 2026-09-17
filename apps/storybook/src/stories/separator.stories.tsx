import type { Meta, StoryObj } from "@storybook/react";

import { Separator } from "@monorepo/ui/components/separator";

const meta = {
  title: "Storybook/Separator",
  component: Separator,
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
    },
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    orientation: "horizontal",
  },
};

export const Orientation: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex h-5 items-center gap-4 text-sm">
        <span>Atlas</span>
        <Separator orientation="vertical" />
        <span>Beacon</span>
        <Separator orientation="vertical" />
        <span>Comet</span>
      </div>
      <div className="flex flex-col gap-3 text-sm">
        <span>Billing migration</span>
        <Separator />
        <span className="text-muted-foreground">Owned by Mira Okafor</span>
      </div>
    </div>
  ),
};
