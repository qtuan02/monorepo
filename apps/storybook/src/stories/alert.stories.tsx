import type { Meta, StoryObj } from "@storybook/react";
import { AlertCircleIcon, InfoIcon } from "lucide-react";

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@monorepo/ui/components/alert";
import { Button } from "@monorepo/ui/components/button";

const meta = {
  title: "Storybook/Alert",
  component: Alert,
  subcomponents: { AlertTitle, AlertDescription, AlertAction },
  tags: ["autodocs"],
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => (
    <Alert>
      <InfoIcon />
      <AlertTitle>Invoice INV-2042 is due soon</AlertTitle>
      <AlertDescription>
        Beacon's $1,800 invoice is due on 2026-07-12. Send a reminder before it
        goes overdue.
      </AlertDescription>
      <AlertAction>
        <Button size="sm" variant="outline">
          Remind
        </Button>
      </AlertAction>
    </Alert>
  ),
};

export const Variants: Story = {
  parameters: {
    controls: { disable: true },
    stage: { width: "lg" },
  },
  render: () => (
    <div className="grid w-full gap-4">
      <Alert>
        <InfoIcon />
        <AlertTitle>Beacon onboarding reached 80%</AlertTitle>
        <AlertDescription>
          Tomás Reyes updated the Beacon rollout checklist. Four steps left
          before it ships to every Northwind team.
        </AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertTitle>Invoice INV-2043 is overdue</AlertTitle>
        <AlertDescription>
          Comet's $3,200 invoice was due on 2026-05-20. Update the payment
          method to avoid a service pause.
        </AlertDescription>
      </Alert>
    </div>
  ),
};
