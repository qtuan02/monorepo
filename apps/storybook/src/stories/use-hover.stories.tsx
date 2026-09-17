import type { Meta, StoryObj } from "@storybook/react";
import { useRef } from "react";

import { useHover } from "@monorepo/hook/use-hover";
import { cn } from "@monorepo/ui/utils/cn";

import { atlasProject as atlas } from "~/support/projects";

function Demo() {
  const ref = useRef<HTMLDivElement>(null);
  const isHovered = useHover(ref);

  return (
    <div
      ref={ref}
      className={cn(
        "flex h-32 w-64 items-center justify-center rounded-md border text-sm transition-colors",
        isHovered && "bg-primary text-primary-foreground",
      )}
    >
      {isHovered ? `${atlas.summary} — open` : atlas.name}
    </div>
  );
}

const meta = {
  title: "Hooks/useHover",
  component: Demo,
  tags: ["autodocs"],
} satisfies Meta<typeof Demo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
