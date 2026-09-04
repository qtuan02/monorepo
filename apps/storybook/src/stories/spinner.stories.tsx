import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "@monorepo/ui/components/button";
import { Spinner } from "@monorepo/ui/components/spinner";

const meta = {
  title: "Storybook/Spinner",
  component: Spinner,
  tags: ["autodocs"],
} satisfies Meta<typeof Spinner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  render: () => <Spinner />,
};

export const Sizes: Story = {
  args: {},
  render: () => (
    <div className="flex items-center gap-4">
      <Spinner className="size-3" />
      <Spinner className="size-4" />
      <Spinner className="size-6" />
      <Spinner className="size-8" />
    </div>
  ),
};

export const InsideButton: Story = {
  args: {},
  render: () => (
    <Button disabled>
      <Spinner />
      Please wait
    </Button>
  ),
};
