import type { Meta, StoryObj } from "@storybook/react";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@monorepo/ui/components/field";
import { Switch } from "@monorepo/ui/components/switch";

import { currentPerson } from "~/support/people";

const meta = {
  title: "Storybook/Switch",
  component: Switch,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["default", "sm"],
    },
    disabled: {
      control: "boolean",
    },
    defaultChecked: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    "aria-label": "Share across devices",
    size: "default",
    disabled: false,
    defaultChecked: false,
  },
};

export const States: Story = {
  parameters: { stage: { width: "sm" } },
  render: () => (
    <FieldGroup>
      <FieldLabel htmlFor="switch-atlas-updates">
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle>Atlas updates</FieldTitle>
            <FieldDescription>
              Notify {currentPerson.name} when the billing migration status
              changes.
            </FieldDescription>
          </FieldContent>
          <Switch id="switch-atlas-updates" defaultChecked />
        </Field>
      </FieldLabel>
      <FieldLabel htmlFor="switch-weekly-digest">
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle>Weekly digest</FieldTitle>
            <FieldDescription>
              A summary of Northwind activity every Monday morning.
            </FieldDescription>
          </FieldContent>
          <Switch id="switch-weekly-digest" />
        </Field>
      </FieldLabel>
      <FieldLabel htmlFor="switch-disabled" data-disabled>
        <Field orientation="horizontal" data-disabled>
          <FieldContent>
            <FieldTitle>Beacon sync</FieldTitle>
            <FieldDescription>
              Managed by the Beacon workspace.
            </FieldDescription>
          </FieldContent>
          <Switch id="switch-disabled" disabled />
        </Field>
      </FieldLabel>
    </FieldGroup>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Switch size="sm" aria-label="Small switch" defaultChecked />
      <Switch aria-label="Default switch" defaultChecked />
    </div>
  ),
};
