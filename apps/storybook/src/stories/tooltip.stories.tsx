import type { Meta, StoryObj } from "@storybook/react";
import { InfoIcon } from "lucide-react";

import { Button } from "@monorepo/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@monorepo/ui/components/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@monorepo/ui/components/tooltip";

import { atlasProject as atlas } from "~/support/projects";

const meta = {
  title: "Storybook/Tooltip",
  component: Tooltip,
  subcomponents: { TooltipTrigger, TooltipContent },
  tags: ["autodocs"],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => (
    <Tooltip>
      <TooltipTrigger
        render={<Button variant="outline">Invite teammate</Button>}
      />
      <TooltipContent>
        <p>Add someone to {atlas.name}</p>
      </TooltipContent>
    </Tooltip>
  ),
};

export const Sides: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {(["left", "top", "bottom", "right"] as const).map((side) => (
        <Tooltip key={side}>
          <TooltipTrigger
            render={
              <Button variant="outline" className="w-fit capitalize">
                {side}
              </Button>
            }
          />
          <TooltipContent side={side}>
            <p>Add someone to {atlas.name}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  ),
};

export const Stacking: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger
        render={<Button variant="outline">Billing role</Button>}
      />
      <PopoverContent className="w-64" align="start">
        <div className="flex items-center gap-1.5 text-sm">
          <span>Owner</span>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Why can't I change this?"
                >
                  <InfoIcon className="size-3.5" />
                </Button>
              }
            />
            <TooltipContent>
              <p>
                This confirmation opens above the popover — a stacking
                regression would hide it behind the panel instead.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </PopoverContent>
    </Popover>
  ),
};
