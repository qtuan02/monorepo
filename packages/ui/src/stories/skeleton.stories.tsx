import type { Meta, StoryObj } from "@storybook/react";

import { Skeleton } from "../components/skeleton";

const meta = {
  title: "UI/Skeleton",
  component: Skeleton,
  args: {
    className: "h-12 w-full max-w-md",
  },
} satisfies Meta<typeof Skeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const CardPlaceholder: Story = {
  render: () => (
    <div className="flex max-w-md flex-col gap-3">
      <Skeleton className="h-32 w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  ),
};
