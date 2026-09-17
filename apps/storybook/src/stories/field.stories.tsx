import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "@monorepo/ui/components/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@monorepo/ui/components/field";
import { Input } from "@monorepo/ui/components/input";
import {
  RadioGroup,
  RadioGroupItem,
} from "@monorepo/ui/components/radio-group";

import { currentPerson, tomasReyes } from "~/support/people";

const meta = {
  title: "Storybook/Field",
  component: Field,
  subcomponents: {
    FieldGroup,
    FieldLabel,
    FieldContent,
    FieldDescription,
    FieldSet,
    FieldLegend,
    FieldTitle,
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Field>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => (
    <FieldGroup className="w-full">
      <Field>
        <FieldLabel htmlFor="teammate-name">Name</FieldLabel>
        <Input id="teammate-name" placeholder={tomasReyes.name} required />
      </Field>
      <Field>
        <FieldLabel htmlFor="teammate-email">Email</FieldLabel>
        <Input
          id="teammate-email"
          type="email"
          placeholder="tomas@northwind.dev"
        />
        <FieldDescription>
          We'll send the invite to this address.
        </FieldDescription>
      </Field>
    </FieldGroup>
  ),
};

export const Fieldset: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => (
    <FieldSet className="w-full">
      <FieldLegend>Workspace address</FieldLegend>
      <FieldDescription>Used on Northwind invoices.</FieldDescription>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="street">Street address</FieldLabel>
          <Input id="street" placeholder="500 Harbor Way" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="city">City</FieldLabel>
            <Input id="city" placeholder="Seattle" />
          </Field>
          <Field>
            <FieldLabel htmlFor="zip">Postal code</FieldLabel>
            <Input id="zip" placeholder="98101" />
          </Field>
        </div>
      </FieldGroup>
    </FieldSet>
  ),
};

export const ChoiceCard: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => (
    <FieldSet className="w-full">
      <FieldLegend variant="label">Compute environment</FieldLegend>
      <FieldDescription>
        Select the environment for the Comet build pipeline.
      </FieldDescription>
      <RadioGroup defaultValue="kubernetes">
        <FieldLabel htmlFor="kubernetes-comet">
          <Field orientation="horizontal">
            <FieldContent>
              <FieldTitle>Kubernetes</FieldTitle>
              <FieldDescription>
                Run builds on a shared cluster.
              </FieldDescription>
            </FieldContent>
            <RadioGroupItem value="kubernetes" id="kubernetes-comet" />
          </Field>
        </FieldLabel>
        <FieldLabel htmlFor="vm-comet">
          <Field orientation="horizontal">
            <FieldContent>
              <FieldTitle>Virtual machine</FieldTitle>
              <FieldDescription>Dedicated machine per build.</FieldDescription>
            </FieldContent>
            <RadioGroupItem value="vm" id="vm-comet" />
          </Field>
        </FieldLabel>
      </RadioGroup>
    </FieldSet>
  ),
};

export const Responsive: Story = {
  parameters: {
    controls: { disable: true },
    stage: { width: "lg" },
  },
  render: () => (
    <form className="w-full">
      <FieldSet>
        <FieldLegend>Profile</FieldLegend>
        <FieldDescription>
          Fill in {currentPerson.name}'s profile information.
        </FieldDescription>
        <FieldGroup>
          <Field orientation="responsive">
            <FieldContent>
              <FieldLabel htmlFor="profile-name">Name</FieldLabel>
              <FieldDescription>Shown across Northwind.</FieldDescription>
            </FieldContent>
            <Input
              id="profile-name"
              defaultValue={currentPerson.name}
              required
            />
          </Field>
          <Field orientation="responsive">
            <Button type="submit">Save</Button>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  ),
};
