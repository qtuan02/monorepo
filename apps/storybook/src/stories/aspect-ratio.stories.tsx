import type { Meta, StoryObj } from "@storybook/react";

import { AspectRatio } from "@monorepo/ui/components/aspect-ratio";

const meta = {
  title: "Storybook/AspectRatio",
  component: AspectRatio,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof AspectRatio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {} as Story["args"],
  render: () => (
    <div className="w-[450px]">
      <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg">
        <img
          src="https://avatar.vercel.sh/shadcn1"
          alt="Photo"
          className="h-full w-full rounded-lg object-cover"
        />
      </AspectRatio>
    </div>
  ),
};
