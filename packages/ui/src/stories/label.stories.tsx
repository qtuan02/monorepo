import type { Meta, StoryObj } from "@storybook/react";

import { Input } from "../components/input";
import { Label } from "../components/label";

const meta = {
  title: "UI/Label",
  component: Label,
  args: {
    children: "Label",
  },
} satisfies Meta<typeof Label>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithInput: Story = {
  render: () => (
    <div className="grid w-80 max-w-full gap-2">
      <Label htmlFor="story-email">Email</Label>
      <Input id="story-email" type="email" placeholder="you@example.com" />
    </div>
  ),
};
