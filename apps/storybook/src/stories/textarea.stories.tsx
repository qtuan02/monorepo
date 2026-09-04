import type { Meta, StoryObj } from "@storybook/react";

import { Field, FieldLabel } from "@monorepo/ui/components/field";
import { Textarea } from "@monorepo/ui/components/textarea";

const meta = {
  title: "Storybook/Textarea",
  component: Textarea,
  tags: ["autodocs"],
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  render: () => (
    <Field className="max-w-sm">
      <FieldLabel htmlFor="message">Message</FieldLabel>
      <Textarea id="message" placeholder="Type your message here." />
    </Field>
  ),
};
