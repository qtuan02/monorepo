import type { Meta, StoryObj } from "@storybook/react";

import { Progress } from "@monorepo/ui/components/progress";

const meta = {
  title: "Storybook/Progress",
  component: Progress,
  tags: ["autodocs"],
  args: {
    value: null,
  },
  argTypes: {
    value: {
      control: { type: "range", min: 0, max: 100, step: 1 },
    },
  },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 66,
    className: "w-full",
  },
};

export const States: Story = {
  render: () => (
    <div className="flex w-full flex-col gap-4">
      <Progress value={12} aria-label="Beacon onboarding" className="w-full" />
      <Progress value={58} aria-label="Comet mobile app" className="w-full" />
      <Progress
        value={92}
        aria-label="Delta design system"
        className="w-full"
      />
      <Progress
        value={100}
        aria-label="Atlas billing migration"
        className="w-full"
      />
    </div>
  ),
};
