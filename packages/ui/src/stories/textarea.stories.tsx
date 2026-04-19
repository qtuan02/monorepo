import type { Meta, StoryObj } from "@storybook/react";

import { Textarea } from "../components/textarea";

const meta = {
  title: "UI/Textarea",
  component: Textarea,
  args: {
    placeholder: "Write something…",
    rows: 4,
  },
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: "Disabled",
  },
};

export const Invalid: Story = {
  args: {
    "aria-invalid": true,
  },
};
