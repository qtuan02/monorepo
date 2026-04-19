import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "../components/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../components/tooltip";

const meta = {
  title: "UI/Tooltip",
  component: Tooltip,
} satisfies Meta<typeof Tooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Hover me</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Add to library</p>
      </TooltipContent>
    </Tooltip>
  ),
};

export const Sides: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Tooltip key={side}>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm">
              {side}
            </Button>
          </TooltipTrigger>
          <TooltipContent side={side}>
            <p>Side {side}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  ),
};
