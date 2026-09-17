import type { Meta, StoryObj } from "@storybook/react";

import { Checkbox } from "@monorepo/ui/components/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@monorepo/ui/components/field";

import { currentPerson } from "~/support/people";

const meta = {
  title: "Storybook/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  argTypes: {
    disabled: {
      control: "boolean",
    },
    defaultChecked: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    "aria-label": "Accept terms and conditions",
    disabled: false,
    defaultChecked: false,
  },
};

export const States: Story = {
  parameters: { stage: { width: "sm" } },
  render: () => (
    <FieldGroup>
      <Field orientation="horizontal">
        <Checkbox id="atlas-terms" name="atlas-terms" />
        <FieldLabel htmlFor="atlas-terms">
          Accept terms and conditions
        </FieldLabel>
      </Field>
      <Field orientation="horizontal">
        <Checkbox id="atlas-notify" name="atlas-notify" defaultChecked />
        <FieldContent>
          <FieldLabel htmlFor="atlas-notify">Enable notifications</FieldLabel>
          <FieldDescription>
            Notify me when Atlas invoices are marked paid.
          </FieldDescription>
        </FieldContent>
      </Field>
      <Field orientation="horizontal" data-disabled>
        <Checkbox id="atlas-sync" name="atlas-sync" disabled />
        <FieldLabel htmlFor="atlas-sync">Sync with Beacon</FieldLabel>
      </Field>
    </FieldGroup>
  ),
};

export const Group: Story = {
  render: () => (
    <FieldSet>
      <FieldLegend variant="label">
        Notify {currentPerson.name} about:
      </FieldLegend>
      <FieldDescription>
        Choose which Northwind events send a notification.
      </FieldDescription>
      <FieldGroup className="gap-3">
        <Field orientation="horizontal">
          <Checkbox
            id="notify-invoices"
            name="notify-invoices"
            defaultChecked
          />
          <FieldLabel htmlFor="notify-invoices" className="font-normal">
            Overdue invoices
          </FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <Checkbox
            id="notify-comments"
            name="notify-comments"
            defaultChecked
          />
          <FieldLabel htmlFor="notify-comments" className="font-normal">
            Project comments
          </FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <Checkbox id="notify-mentions" name="notify-mentions" />
          <FieldLabel htmlFor="notify-mentions" className="font-normal">
            Teammate mentions
          </FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <Checkbox id="notify-releases" name="notify-releases" />
          <FieldLabel htmlFor="notify-releases" className="font-normal">
            Release notes
          </FieldLabel>
        </Field>
      </FieldGroup>
    </FieldSet>
  ),
};
