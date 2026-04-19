import type { Meta, StoryObj } from "@storybook/react";
import { MailIcon } from "lucide-react";

import { Button } from "../components/button";

const variants = [
  "default",
  "destructive",
  "outline",
  "secondary",
  "ghost",
  "link",
] as const;
const sizes = ["default", "sm", "lg", "icon", "icon-sm", "icon-lg"] as const;

const meta = {
  title: "UI/Button",
  component: Button,
  argTypes: {
    variant: {
      control: "select",
      options: variants,
    },
    size: {
      control: "select",
      options: sizes,
    },
    disabled: { control: "boolean" },
    asChild: { control: "boolean" },
  },
  args: {
    children: "Button",
    variant: "default",
    size: "default",
    disabled: false,
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      {variants.map((variant) => (
        <Button key={variant} variant={variant}>
          {variant}
        </Button>
      ))}
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon" aria-label="Mail">
        <MailIcon />
      </Button>
      <Button size="icon-sm" aria-label="Mail sm">
        <MailIcon />
      </Button>
      <Button size="icon-lg" aria-label="Mail lg">
        <MailIcon />
      </Button>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: "Disabled",
  },
};

export const AsChild: Story = {
  args: {
    asChild: true,
    children: <a href="/">Link as button</a>,
  },
};
