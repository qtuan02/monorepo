import type { Meta, StoryObj } from "@storybook/react";
import { CalendarIcon } from "lucide-react";

import { Button } from "@monorepo/ui/components/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@monorepo/ui/components/hover-card";

const meta = {
  title: "Storybook/HoverCard",
  component: HoverCard,
  tags: ["autodocs"],
} satisfies Meta<typeof HoverCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  render: () => (
    <HoverCard>
      <HoverCardTrigger render={<Button variant="link">@nextjs</Button>} />
      <HoverCardContent className="w-80">
        <div className="space-y-1">
          <h4 className="text-sm font-semibold">@nextjs</h4>
          <p className="text-muted-foreground text-sm">
            The React Framework – created and maintained by @vercel.
          </p>
          <div className="text-muted-foreground flex items-center gap-1 text-xs">
            <CalendarIcon className="size-3" />
            <span>Joined December 2021</span>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};
