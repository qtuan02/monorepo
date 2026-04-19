import type { Meta, StoryObj } from "@storybook/react";

import { ScrollArea } from "../components/scroll-area";
import { Separator } from "../components/separator";

const meta = {
  title: "UI/ScrollArea",
  component: ScrollArea,
} satisfies Meta<typeof ScrollArea>;

export default meta;

type Story = StoryObj<typeof meta>;

const longText = Array.from({ length: 20 }, (_, i) => (
  <div key={i}>
    <div className="text-sm">Line {i + 1}</div>
    {i < 19 && <Separator className="my-2" />}
  </div>
));

export const Vertical: Story = {
  render: () => (
    <ScrollArea className="h-48 w-72 rounded-md border p-4">
      {longText}
    </ScrollArea>
  ),
};
