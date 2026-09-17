import type { Meta, StoryObj } from "@storybook/react";

import { ScrollArea, ScrollBar } from "@monorepo/ui/components/scroll-area";
import { Separator } from "@monorepo/ui/components/separator";

import { northwindProjects } from "~/support/projects";

const meta = {
  title: "Storybook/ScrollArea",
  component: ScrollArea,
  subcomponents: { ScrollBar },
  tags: ["autodocs"],
} satisfies Meta<typeof ScrollArea>;

export default meta;

type Story = StoryObj<typeof meta>;

const atlasReleases = Array.from(
  { length: 50 },
  (_, i) => `v1.2.0-beta.${i + 1}`,
);

export const Default: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <ScrollArea className="h-72 w-48 rounded-md border">
      <div className="p-4">
        <h4 className="mb-4 text-sm leading-none font-medium">
          Atlas releases
        </h4>
        {atlasReleases.map((tag) => (
          <div key={tag}>
            <div className="text-sm">{tag}</div>
            <Separator className="my-2" />
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const Orientation: Story = {
  render: () => (
    <ScrollArea className="rounded-md border">
      <div className="flex w-max gap-3 p-4">
        {northwindProjects.map((project) => (
          <div
            key={project.id}
            className="w-40 shrink-0 rounded-lg border p-3 text-sm"
          >
            <div className="font-medium">{project.name}</div>
            <div className="text-muted-foreground">{project.summary}</div>
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};
