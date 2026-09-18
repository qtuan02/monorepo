import type { Meta, StoryObj } from "@storybook/react";
import { BadgeCheck, BookmarkIcon } from "lucide-react";

import { Badge } from "@monorepo/ui/components/badge";

const meta = {
  title: "Storybook/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "secondary",
        "destructive",
        "outline",
        "ghost",
        "link",
      ],
    },
  },
  parameters: { stage: { width: "sm" } },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Owner",
    variant: "default",
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex w-full flex-wrap justify-center gap-2">
      <Badge>Owner</Badge>
      <Badge variant="secondary">Admin</Badge>
      <Badge variant="destructive">Overdue</Badge>
      <Badge variant="outline">Draft</Badge>
      <Badge variant="ghost">Archived</Badge>
      <Badge variant="link">View invoice</Badge>
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="secondary">
        <BadgeCheck data-icon="inline-start" />
        Invoice paid
      </Badge>
      <Badge variant="outline">
        Save Atlas
        <BookmarkIcon data-icon="inline-end" />
      </Badge>
    </div>
  ),
};
