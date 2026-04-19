import type { Meta, StoryObj } from "@storybook/react";
import { toast } from "sonner";

import { Button } from "../components/button";

const meta = {
  title: "UI/Sonner",
  parameters: {
    layout: "centered",
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => toast("Default toast")}>
        Default
      </Button>
      <Button variant="outline" onClick={() => toast.success("Saved")}>
        Success
      </Button>
      <Button variant="outline" onClick={() => toast.error("Something failed")}>
        Error
      </Button>
      <Button variant="outline" onClick={() => toast.warning("Heads up")}>
        Warning
      </Button>
      <Button variant="outline" onClick={() => toast.info("FYI")}>
        Info
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.promise(new Promise((r) => setTimeout(r, 1500)), {
            loading: "Loading…",
            success: "Done",
            error: "Failed",
          })
        }
      >
        Promise
      </Button>
    </div>
  ),
};
