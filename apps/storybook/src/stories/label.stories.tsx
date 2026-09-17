import type { Meta, StoryObj } from "@storybook/react";

import { Input } from "@monorepo/ui/components/input";
import { Label } from "@monorepo/ui/components/label";

const meta = {
  title: "Storybook/Label",
  component: Label,
  tags: ["autodocs"],
  argTypes: {
    children: {
      control: "text",
    },
  },
} satisfies Meta<typeof Label>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    htmlFor: "project-name",
    children: "Project name",
  },
};

export const WithInput: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Label htmlFor="atlas-owner">Owner</Label>
      <Input id="atlas-owner" defaultValue="Mira Okafor" />
    </div>
  ),
};
