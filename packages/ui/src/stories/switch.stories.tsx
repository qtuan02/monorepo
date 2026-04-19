import type { Meta, StoryObj } from "@storybook/react";

import { Label } from "../components/label";
import { Switch } from "../components/switch";

const meta = {
  title: "UI/Switch",
  component: Switch,
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Switch id="airplane" />
      <Label htmlFor="airplane">Airplane mode</Label>
    </div>
  ),
};

export const DisabledOff: Story = {
  args: { disabled: true, checked: false },
};

export const DisabledOn: Story = {
  args: { disabled: true, checked: true },
};
