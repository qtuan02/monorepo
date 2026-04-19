import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "../components/button";
import { Input } from "../components/input";
import { Label } from "../components/label";
import { Popover, PopoverContent, PopoverTrigger } from "../components/popover";

const meta = {
  title: "UI/Popover",
  component: Popover,
} satisfies Meta<typeof Popover>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="grid gap-2">
          <div className="space-y-1">
            <Label htmlFor="w">Width</Label>
            <Input id="w" defaultValue="100%" className="h-8" />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const Alignments: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      {(["start", "center", "end"] as const).map((align) => (
        <Popover key={align}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              align={align}
            </Button>
          </PopoverTrigger>
          <PopoverContent align={align}>
            <p className="text-sm">Aligned {align}</p>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  ),
};
