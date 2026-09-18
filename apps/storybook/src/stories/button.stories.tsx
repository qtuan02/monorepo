import type { Meta, StoryObj } from "@storybook/react";
import { PlusIcon } from "lucide-react";

import { Button } from "@monorepo/ui/components/button";

const meta = {
  title: "Storybook/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "secondary",
        "destructive",
        "outline",
        "ghost",
        "link",
      ],
    },
    size: {
      control: "select",
      options: [
        "xs",
        "sm",
        "default",
        "lg",
        "icon-xs",
        "icon-sm",
        "icon",
        "icon-lg",
      ],
    },
    disabled: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Open Atlas",
    variant: "default",
    size: "default",
    disabled: false,
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button>Open Atlas</Button>
      <Button variant="secondary">Invite teammate</Button>
      <Button variant="destructive">Delete invoice</Button>
      <Button variant="outline">Export CSV</Button>
      <Button variant="ghost">Dismiss</Button>
      <Button variant="link">View INV-2041</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-8 sm:flex-row">
      <div className="flex items-start gap-2">
        <Button size="xs" variant="outline">
          Extra small
        </Button>
        <Button size="icon-xs" aria-label="Add project" variant="outline">
          <PlusIcon />
        </Button>
      </div>
      <div className="flex items-start gap-2">
        <Button size="sm" variant="outline">
          Small
        </Button>
        <Button size="icon-sm" aria-label="Add project" variant="outline">
          <PlusIcon />
        </Button>
      </div>
      <div className="flex items-start gap-2">
        <Button variant="outline">Default</Button>
        <Button size="icon" aria-label="Add project" variant="outline">
          <PlusIcon />
        </Button>
      </div>
      <div className="flex items-start gap-2">
        <Button variant="outline" size="lg">
          Large
        </Button>
        <Button size="icon-lg" aria-label="Add project" variant="outline">
          <PlusIcon />
        </Button>
      </div>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button>Open Atlas</Button>
      <Button disabled>Open Atlas</Button>
      <Button variant="outline">Invite teammate</Button>
      <Button variant="outline" disabled>
        Invite teammate
      </Button>
    </div>
  ),
};
