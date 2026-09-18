import type { Meta, StoryObj } from "@storybook/react";

import { Skeleton } from "@monorepo/ui/components/skeleton";

const meta = {
  title: "Storybook/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  argTypes: {
    className: {
      control: "select",
      options: ["h-4 w-48", "h-4 w-32", "size-12 rounded-full"],
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    className: "h-4 w-48",
  },
};

export const PersonCard: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Skeleton className="size-12 rounded-full" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  ),
};
