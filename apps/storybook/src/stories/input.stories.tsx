import type { Meta, StoryObj } from "@storybook/react";

import { Input } from "@monorepo/ui/components/input";

const meta = {
  title: "Storybook/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "tel", "search"],
    },
    disabled: {
      control: "boolean",
    },
    "aria-invalid": {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    type: "text",
    placeholder: "Search projects…",
    disabled: false,
  },
};

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Input placeholder="Project name" defaultValue="Atlas" />
      <Input placeholder="Project name" disabled defaultValue="Atlas" />
      <Input placeholder="Project name" aria-invalid defaultValue="" />
    </div>
  ),
};
