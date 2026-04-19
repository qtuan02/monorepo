import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "../components/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../components/hover-card";

const meta = {
  title: "UI/HoverCard",
  component: HoverCard,
} satisfies Meta<typeof HoverCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">@nextjs</Button>
      </HoverCardTrigger>
      <HoverCardContent>
        <div className="space-y-1">
          <p className="text-sm font-semibold">Next.js</p>
          <p className="text-muted-foreground text-xs">The React Framework.</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};
