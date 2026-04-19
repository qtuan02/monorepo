import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { Button } from "../components/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../components/collapsible";

const meta = {
  title: "UI/Collapsible",
  component: Collapsible,
} satisfies Meta<typeof Collapsible>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function CollapsibleDemo() {
    const [open, setOpen] = React.useState(false);
    return (
      <Collapsible
        open={open}
        onOpenChange={setOpen}
        className="w-full max-w-md space-y-2"
      >
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-medium">
            @peduarte starred 3 repositories
          </span>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              {open ? "Hide" : "Show"}
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="text-muted-foreground space-y-2 text-sm">
          <div>@radix-ui/primitives</div>
          <div>@radix-ui/colors</div>
          <div>@stitches/react</div>
        </CollapsibleContent>
      </Collapsible>
    );
  },
};
