import type { Meta, StoryObj } from "@storybook/react";

import { AspectRatio } from "../components/aspect-ratio";

const meta = {
  title: "UI/AspectRatio",
  component: AspectRatio,
} satisfies Meta<typeof AspectRatio>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SixteenNine: Story = {
  render: () => (
    <div className="w-full max-w-md">
      <AspectRatio ratio={16 / 9}>
        <img
          src="https://images.unsplash.com/photo-1738946994388-6c7e0beda89a?w=800&auto=format&fit=crop"
          alt="Sample"
          className="h-full w-full rounded-md object-cover"
        />
      </AspectRatio>
    </div>
  ),
};

export const Square: Story = {
  render: () => (
    <div className="w-48">
      <AspectRatio ratio={1}>
        <div className="bg-muted flex h-full w-full items-center justify-center rounded-md text-sm">
          1:1
        </div>
      </AspectRatio>
    </div>
  ),
};
