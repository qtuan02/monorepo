import type { Meta, StoryObj } from "@storybook/react";
import { PinIcon } from "lucide-react";

import { Toggle } from "@monorepo/ui/components/toggle";

const meta = {
  title: "Storybook/Toggle",
  component: Toggle,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline"],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg"],
    },
    disabled: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: "default",
    size: "default",
    disabled: false,
    "aria-label": "Pin Atlas",
    children: <PinIcon />,
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Toggle aria-label="Pin Atlas">
        <PinIcon />
      </Toggle>
      <Toggle variant="outline" aria-label="Pin Atlas">
        <PinIcon />
      </Toggle>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Toggle size="sm" variant="outline" aria-label="Pin Atlas">
        <PinIcon />
      </Toggle>
      <Toggle variant="outline" aria-label="Pin Atlas">
        <PinIcon />
      </Toggle>
      <Toggle size="lg" variant="outline" aria-label="Pin Atlas">
        <PinIcon />
      </Toggle>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Toggle variant="outline" aria-label="Pin Atlas">
        <PinIcon />
      </Toggle>
      <Toggle variant="outline" defaultPressed aria-label="Pin Atlas">
        <PinIcon />
      </Toggle>
      <Toggle variant="outline" disabled aria-label="Pin Atlas">
        <PinIcon />
      </Toggle>
    </div>
  ),
};
