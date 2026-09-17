import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { useTimeout } from "@monorepo/hook/use-timeout";
import { Button } from "@monorepo/ui/components/button";

function Demo() {
  const [delay, setDelay] = useState<number | null>(null);
  const [fired, setFired] = useState(false);

  useTimeout(() => setFired(true), delay);

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="outline"
        disabled={delay !== null && !fired}
        onClick={() => {
          setFired(false);
          setDelay(2000);
        }}
      >
        Fire in 2s
      </Button>
      <p className="text-sm">
        {delay === null ? "Idle" : fired ? "Fired" : "Waiting…"}
      </p>
    </div>
  );
}

const meta = {
  title: "Hooks/useTimeout",
  component: Demo,
  tags: ["autodocs"],
} satisfies Meta<typeof Demo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
