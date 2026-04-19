import type { Meta, StoryObj } from "@storybook/react";

import { Progress } from "../components/progress";

const meta = {
  title: "UI/Progress",
  component: Progress,
  args: {
    value: 45,
    className: "w-full max-w-md",
  },
} satisfies Meta<typeof Progress>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Empty: Story = {
  args: { value: 0 },
};

export const Half: Story = {
  args: { value: 50 },
};

export const Complete: Story = {
  args: { value: 100 },
};
