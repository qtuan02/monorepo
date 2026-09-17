import type { Meta, StoryObj } from "@storybook/react";

import { useCountdown } from "@monorepo/hook/use-countdown";
import { Button } from "@monorepo/ui/components/button";

function Demo() {
  const [timeLeft, reset] = useCountdown(10);

  return (
    <div className="flex items-center gap-4">
      <span className="font-mono text-4xl tabular-nums">{timeLeft}s</span>
      <Button variant="outline" onClick={reset}>
        Reset
      </Button>
    </div>
  );
}

const meta = {
  title: "Hooks/useCountdown",
  component: Demo,
  tags: ["autodocs"],
} satisfies Meta<typeof Demo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
