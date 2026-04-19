import type { Meta, StoryObj } from "@storybook/react";

import { Checkbox } from "../components/checkbox";
import { Label } from "../components/label";

const meta = {
  title: "UI/Checkbox",
  component: Checkbox,
  args: {},
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms">Accept terms</Label>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const CheckedDisabled: Story = {
  args: {
    disabled: true,
    checked: true,
  },
};
