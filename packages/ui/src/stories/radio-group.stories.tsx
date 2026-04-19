import type { Meta, StoryObj } from "@storybook/react";

import { Label } from "../components/label";
import { RadioGroup, RadioGroupItem } from "../components/radio-group";

const meta = {
  title: "UI/RadioGroup",
  component: RadioGroup,
  args: {
    defaultValue: "a",
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <RadioGroup {...args} className="max-w-xs">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="a" id="r-a" />
        <Label htmlFor="r-a">Option A</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="b" id="r-b" />
        <Label htmlFor="r-b">Option B</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="c" id="r-c" />
        <Label htmlFor="r-c">Option C</Label>
      </div>
    </RadioGroup>
  ),
};

export const Disabled: Story = {
  render: () => (
    <RadioGroup defaultValue="a" disabled className="max-w-xs">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="a" id="d-a" />
        <Label htmlFor="d-a">Disabled group</Label>
      </div>
    </RadioGroup>
  ),
};
