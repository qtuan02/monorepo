import type { Meta, StoryObj } from "@storybook/react";
import { CalendarIcon } from "lucide-react";

import { Button } from "@monorepo/ui/components/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@monorepo/ui/components/hover-card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@monorepo/ui/components/popover";

import { northwindPeople } from "~/support/people";
import { atlasProject as atlas } from "~/support/projects";

const [mira, tomas] = northwindPeople;

const meta = {
  title: "Storybook/HoverCard",
  component: HoverCard,
  subcomponents: { HoverCardTrigger, HoverCardContent },
  tags: ["autodocs"],
} satisfies Meta<typeof HoverCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => (
    <HoverCard>
      <HoverCardTrigger render={<Button variant="link">@{tomas?.id}</Button>} />
      <HoverCardContent className="w-80">
        <div className="space-y-1">
          <h4 className="text-sm font-semibold">{tomas?.name}</h4>
          <p className="text-muted-foreground text-sm">
            {tomas?.role} on {atlas.name} — Northwind's billing migration.
          </p>
          <div className="text-muted-foreground flex items-center gap-1 text-xs">
            <CalendarIcon className="size-3" />
            <span>Joined Northwind in 2021</span>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};

export const Stacking: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger
        render={<Button variant="outline">{atlas.name} team</Button>}
      />
      <PopoverContent className="w-64" align="start">
        <div className="flex flex-col gap-2 text-sm">
          <HoverCard>
            <HoverCardTrigger
              render={<Button variant="link">{mira?.name}</Button>}
            />
            <HoverCardContent className="w-72">
              <p className="text-sm">
                {mira?.role} — this card opens above the popover, where a
                stacking regression would hide it behind the panel instead.
              </p>
            </HoverCardContent>
          </HoverCard>
        </div>
      </PopoverContent>
    </Popover>
  ),
};
