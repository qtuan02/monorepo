import type { Meta, StoryObj } from "@storybook/react";
import { BoldIcon, ItalicIcon } from "lucide-react";

import { Toggle } from "../components/toggle";

const variants = ["default", "outline"] as const;
const sizes = ["default", "sm", "lg"] as const;

const meta = {
  title: "UI/Toggle",
  component: Toggle,
  argTypes: {
    variant: { control: "select", options: variants },
    size: { control: "select", options: sizes },
    pressed: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    variant: "default",
    size: "default",
    children: <BoldIcon />,
    "aria-label": "Toggle bold",
  },
} satisfies Meta<typeof Toggle>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      {variants.map((variant) => (
        <Toggle key={variant} variant={variant} aria-label={variant}>
          <BoldIcon />
        </Toggle>
      ))}
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      {sizes.map((size) => (
        <Toggle key={size} size={size} aria-label={size}>
          <ItalicIcon />
        </Toggle>
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: <BoldIcon />,
    "aria-label": "Disabled",
  },
};
