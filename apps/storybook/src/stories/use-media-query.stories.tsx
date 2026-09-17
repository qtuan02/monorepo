import type { Meta, StoryObj } from "@storybook/react";

import { useMediaQuery } from "@monorepo/hook/use-media-query";
import { Badge } from "@monorepo/ui/components/badge";

const QUERY = "(min-width: 640px)";

function Demo() {
  const matches = useMediaQuery(QUERY);

  return (
    <div className="flex flex-col items-start gap-2">
      <Badge variant={matches ? "default" : "secondary"}>
        {matches ? "matches" : "does not match"}
      </Badge>
      <p className="text-muted-foreground text-sm">
        <code>{QUERY}</code> — resize the viewport to see it flip.
      </p>
    </div>
  );
}

const meta = {
  title: "Hooks/useMediaQuery",
  component: Demo,
  tags: ["autodocs"],
} satisfies Meta<typeof Demo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
