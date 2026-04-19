import type { Meta, StoryObj } from "@storybook/react";

import { Input } from "../components/input";

const meta = {
  title: "UI/Input",
  component: Input,
  args: {
    placeholder: "Placeholder",
    type: "text",
  },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Types: Story = {
  render: () => (
    <div className="flex w-80 max-w-full flex-col gap-3">
      <Input type="text" placeholder="text" />
      <Input type="email" placeholder="email" />
      <Input type="password" placeholder="password" />
      <Input type="number" placeholder="number" />
      <Input type="search" placeholder="search" />
      <Input type="tel" placeholder="tel" />
      <Input type="url" placeholder="url" />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: "Disabled",
  },
};

export const Invalid: Story = {
  args: {
    "aria-invalid": true,
    placeholder: "Invalid",
  },
};
