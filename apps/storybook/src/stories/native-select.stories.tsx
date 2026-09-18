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
  subcomponents: { NativeSelectOptGroup, NativeSelectOption },
  tags: ["autodocs"],
} satisfies Meta<typeof NativeSelect>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    controls: { disable: true },
    stage: { width: "sm" },
  },
  render: () => (
    <Field>
      <FieldLabel htmlFor="native-select-role">Role</FieldLabel>
      <NativeSelect id="native-select-role" defaultValue="member">
        <NativeSelectOption value="owner">Owner</NativeSelectOption>
        <NativeSelectOption value="admin">Admin</NativeSelectOption>
        <NativeSelectOption value="member">Member</NativeSelectOption>
        <NativeSelectOption value="viewer">Viewer</NativeSelectOption>
      </NativeSelect>
    </Field>
  ),
};

export const OptGroup: Story = {
  parameters: {
    controls: { disable: true },
    stage: { width: "sm" },
  },
  render: () => (
    <NativeSelect className="w-full" defaultValue="">
      <NativeSelectOption value="" disabled>
        Choose a project
      </NativeSelectOption>
      <NativeSelectOptGroup label="Active">
        <NativeSelectOption value="atlas">Atlas</NativeSelectOption>
        <NativeSelectOption value="beacon">Beacon</NativeSelectOption>
      </NativeSelectOptGroup>
      <NativeSelectOptGroup label="Archived">
        <NativeSelectOption value="comet">Comet</NativeSelectOption>
        <NativeSelectOption value="delta">Delta</NativeSelectOption>
      </NativeSelectOptGroup>
    </NativeSelect>
  ),
};

export const Sizes: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <NativeSelect size="default" defaultValue="member">
        <NativeSelectOption value="member">Default size</NativeSelectOption>
      </NativeSelect>
      <NativeSelect size="sm" defaultValue="member">
        <NativeSelectOption value="member">Small size</NativeSelectOption>
      </NativeSelect>
    </div>
  ),
};

export const States: Story = {
  parameters: {
    controls: { disable: true },
    stage: { width: "sm" },
  },
  render: () => (
    <NativeSelect disabled defaultValue="owner">
      <NativeSelectOption value="owner">Owner</NativeSelectOption>
    </NativeSelect>
  ),
};
