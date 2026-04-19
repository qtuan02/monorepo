import type { Meta, StoryObj } from "@storybook/react";

import { Badge } from "../components/badge";

const variants = ["default", "secondary", "destructive", "outline"] as const;

const meta = {
  title: "UI/Badge",
  component: Badge,
  argTypes: {
    variant: {
      control: "select",
      options: variants,
    },
    asChild: { control: "boolean" },
  },
  args: {
    children: "Badge",
    variant: "default",
  },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      {variants.map((variant) => (
        <Badge key={variant} variant={variant}>
          {variant}
        </Badge>
      ))}
    </div>
  ),
};

export const AsLink: Story = {
  render: () => (
    <Badge asChild>
      <a href="/">Link badge</a>
    </Badge>
  ),
};
