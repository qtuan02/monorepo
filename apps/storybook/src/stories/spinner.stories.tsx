import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "@monorepo/ui/components/button";
import { Spinner } from "@monorepo/ui/components/spinner";

const meta = {
  title: "Storybook/Spinner",
  component: Spinner,
  tags: ["autodocs"],
  argTypes: {
    className: {
      control: "select",
      options: ["size-3", "size-4", "size-6", "size-8"],
    },
  },
} satisfies Meta<typeof Spinner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    className: "size-4",
  },
};

export const Sizes: Story = {
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
  render: () => (
    <Button disabled>
      <Spinner />
      Saving Atlas…
    </Button>
  ),
};
