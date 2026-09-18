import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "@monorepo/ui/components/button";
import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastTitle,
  toast,
} from "@monorepo/ui/components/toast";

import { northwindNotifications } from "~/support/notifications";
import { atlasProject as atlas } from "~/support/projects";

const [commentNotification, overdueNotification, onboardingNotification] =
  northwindNotifications;

const meta = {
  title: "Storybook/Toast",
  subcomponents: {
    Toast,
    ToastTitle,
    ToastDescription,
    ToastAction,
    ToastClose,
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        onClick={() => toast.add({ title: `${atlas.name} was updated` })}
      >
        Default
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.add({ title: "Invoice INV-2041 marked paid", type: "success" })
        }
      >
        Success
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.add({
            title: "Delivery migration starts in 10 minutes",
            type: "info",
          })
        }
      >
        Info
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.add({
            title: "Invoice INV-2043 is 5 days overdue",
            type: "warning",
          })
        }
      >
        Warning
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.add({ title: `${atlas.name} export failed`, type: "error" })
        }
      >
        Error
      </Button>
    </div>
  ),
};

export const Stacking: Story = {
  render: () => (
    <Button
      variant="outline"
      onClick={() => {
        toast.add({ title: commentNotification?.message });
        toast.add({ title: overdueNotification?.message, type: "warning" });
        toast.add({ title: onboardingNotification?.message, type: "success" });
      }}
    >
      Notify team
    </Button>
  ),
};
