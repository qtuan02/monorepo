import type { Meta, StoryObj } from "@storybook/react";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@monorepo/ui/components/field";
import {
  RadioGroup,
  RadioGroupItem,
} from "@monorepo/ui/components/radio-group";

const meta = {
  title: "Storybook/RadioGroup",
  component: RadioGroup,
  subcomponents: { RadioGroupItem },
  tags: ["autodocs"],
} satisfies Meta<typeof RadioGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    controls: { disable: true },
    stage: { width: "lg" },
  },
  render: () => (
    <RadioGroup defaultValue="team" className="w-full">
      <FieldLabel htmlFor="plan-starter">
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle>Starter</FieldTitle>
            <FieldDescription>
              For individuals and small teams.
            </FieldDescription>
          </FieldContent>
          <RadioGroupItem value="starter" id="plan-starter" />
        </Field>
      </FieldLabel>
      <FieldLabel htmlFor="plan-team">
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle>Team</FieldTitle>
            <FieldDescription>
              For growing workspaces like Northwind.
            </FieldDescription>
          </FieldContent>
          <RadioGroupItem value="team" id="plan-team" />
        </Field>
      </FieldLabel>
      <FieldLabel htmlFor="plan-enterprise">
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle>Enterprise</FieldTitle>
            <FieldDescription>
              For large teams and enterprises.
            </FieldDescription>
          </FieldContent>
          <RadioGroupItem value="enterprise" id="plan-enterprise" />
        </Field>
      </FieldLabel>
    </RadioGroup>
  ),
};

export const Fieldset: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => (
    <FieldSet className="w-full">
      <FieldLegend variant="label">Billing frequency</FieldLegend>
      <FieldDescription>
        Yearly billing saves Northwind 15% over monthly.
      </FieldDescription>
      <RadioGroup defaultValue="monthly">
        <Field orientation="horizontal">
          <RadioGroupItem value="monthly" id="billing-monthly" />
          <FieldLabel htmlFor="billing-monthly" className="font-normal">
            Monthly ($29/month)
          </FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <RadioGroupItem value="yearly" id="billing-yearly" />
          <FieldLabel htmlFor="billing-yearly" className="font-normal">
            Yearly ($295/year)
          </FieldLabel>
        </Field>
      </RadioGroup>
    </FieldSet>
  ),
};

export const Invalid: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => (
    <FieldSet className="w-full">
      <FieldLegend variant="label">Notification channel</FieldLegend>
      <FieldDescription>
        Choose how Northwind should notify you about Atlas.
      </FieldDescription>
      <RadioGroup defaultValue="email">
        <Field orientation="horizontal" data-invalid>
          <RadioGroupItem value="email" id="invalid-email" aria-invalid />
          <FieldLabel htmlFor="invalid-email" className="font-normal">
            Email only
          </FieldLabel>
        </Field>
        <Field orientation="horizontal" data-invalid>
          <RadioGroupItem value="sms" id="invalid-sms" aria-invalid />
          <FieldLabel htmlFor="invalid-sms" className="font-normal">
            SMS only
          </FieldLabel>
        </Field>
      </RadioGroup>
    </FieldSet>
  ),
};
