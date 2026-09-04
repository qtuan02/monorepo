import type { Meta, StoryObj } from "@storybook/react";

import { Field, FieldLabel } from "@monorepo/ui/components/field";
import {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from "@monorepo/ui/components/native-select";

const meta = {
  title: "Storybook/NativeSelect",
  component: NativeSelect,
  tags: ["autodocs"],
} satisfies Meta<typeof NativeSelect>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  render: () => (
    <Field className="w-full max-w-xs">
      <FieldLabel htmlFor="native-select-department">Department</FieldLabel>
      <NativeSelect id="native-select-department" defaultValue="engineering">
        <NativeSelectOption value="engineering">Engineering</NativeSelectOption>
        <NativeSelectOption value="design">Design</NativeSelectOption>
        <NativeSelectOption value="marketing">Marketing</NativeSelectOption>
        <NativeSelectOption value="sales">Sales</NativeSelectOption>
      </NativeSelect>
    </Field>
  ),
};

export const OptGroup: Story = {
  args: {},
  render: () => (
    <NativeSelect className="w-full max-w-xs" defaultValue="">
      <NativeSelectOption value="" disabled>
        Choose a fruit
      </NativeSelectOption>
      <NativeSelectOptGroup label="Citrus">
        <NativeSelectOption value="orange">Orange</NativeSelectOption>
        <NativeSelectOption value="lemon">Lemon</NativeSelectOption>
      </NativeSelectOptGroup>
      <NativeSelectOptGroup label="Berries">
        <NativeSelectOption value="strawberry">Strawberry</NativeSelectOption>
        <NativeSelectOption value="blueberry">Blueberry</NativeSelectOption>
      </NativeSelectOptGroup>
    </NativeSelect>
  ),
};

export const Sizes: Story = {
  args: {},
  render: () => (
    <div className="flex flex-col gap-4">
      <NativeSelect size="default" defaultValue="default">
        <NativeSelectOption value="default">Default size</NativeSelectOption>
      </NativeSelect>
      <NativeSelect size="sm" defaultValue="sm">
        <NativeSelectOption value="sm">Small size</NativeSelectOption>
      </NativeSelect>
    </div>
  ),
};

export const Disabled: Story = {
  args: {},
  render: () => (
    <NativeSelect disabled defaultValue="disabled">
      <NativeSelectOption value="disabled">Disabled</NativeSelectOption>
    </NativeSelect>
  ),
};
