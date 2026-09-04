import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "@monorepo/ui/components/button";
import { toast } from "@monorepo/ui/components/toast";

const meta = {
  title: "Storybook/Toast",
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        onClick={() => toast.add({ title: "Event has been created" })}
      >
        Default
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.add({ title: "Event has been created", type: "success" })
        }
      >
        Success
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.add({
            title: "Be at the area 10 minutes before the event time",
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
            title: "Event start time cannot be earlier than 8am",
            type: "warning",
          })
        }
      >
        Warning
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.add({ title: "Event has not been created", type: "error" })
        }
      >
        Error
      </Button>
    </div>
  ),
};
