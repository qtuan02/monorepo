import type { Meta, StoryObj } from "@storybook/react";

import { Textarea } from "@monorepo/ui/components/textarea";

const meta = {
  title: "Storybook/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  argTypes: {
    disabled: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Describe the task in natural language…",
    disabled: false,
  },
};
