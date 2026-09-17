import type { Meta, StoryObj } from "@storybook/react";

import { AspectRatio } from "@monorepo/ui/components/aspect-ratio";

import { atlasProject } from "~/support/projects";

const meta = {
  title: "Storybook/AspectRatio",
  component: AspectRatio,
  tags: ["autodocs"],
  argTypes: {
    ratio: { control: "number" },
  },
} satisfies Meta<typeof AspectRatio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    ratio: 16 / 9,
    className: "rounded-lg bg-muted",
    children: (
      <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
        {atlasProject.name} cover
      </div>
    ),
  },
};
