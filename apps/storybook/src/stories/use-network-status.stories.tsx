import type { Meta, StoryObj } from "@storybook/react";

import { useNetworkStatus } from "@monorepo/hook/use-network-status";
import { Badge } from "@monorepo/ui/components/badge";

function Demo() {
  const isOnline = useNetworkStatus();

  return (
    <div className="flex flex-col items-start gap-2">
      <Badge variant={isOnline ? "default" : "destructive"}>
        {isOnline ? "online" : "offline"}
      </Badge>
      <p className="text-muted-foreground text-sm">
        Switch the network off in devtools to see it flip.
      </p>
    </div>
  );
}

const meta = {
  title: "Hooks/useNetworkStatus",
  component: Demo,
  tags: ["autodocs"],
} satisfies Meta<typeof Demo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
