import type { Meta, StoryObj } from "@storybook/react";

import { ScrollArea } from "@monorepo/ui/components/scroll-area";
import { Separator } from "@monorepo/ui/components/separator";

const meta = {
  title: "Storybook/ScrollArea",
  component: ScrollArea,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof ScrollArea>;

export default meta;

type Story = StoryObj<typeof meta>;

const tags = Array.from({ length: 50 }, (_, i) => `v1.2.0-beta.${i + 1}`);

export const Default: Story = {
  args: {},
  render: () => (
    <ScrollArea className="h-72 w-48 rounded-md border">
      <div className="p-4">
        <h4 className="mb-4 text-sm leading-none font-medium">Tags</h4>
        {tags.map((tag) => (
          <div key={tag}>
            <div className="text-sm">{tag}</div>
            <Separator className="my-2" />
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};
