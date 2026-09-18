import type { Meta, StoryObj } from "@storybook/react";

import { useCounter } from "@monorepo/hook/use-counter";
import { Button } from "@monorepo/ui/components/button";

import { northwindPeople } from "~/support/people";
import { atlasProject as atlas } from "~/support/projects";

const seatLimit = northwindPeople.length;

function Demo() {
  const { count, increment, decrement, reset, set } = useCounter(0);

  return (
    <div className="flex items-center gap-2">
      <span className="w-12 text-center font-mono text-2xl tabular-nums">
        {count}
      </span>
      <span className="text-muted-foreground text-sm">
        seats on {atlas.name}
      </span>
      <Button variant="outline" onClick={decrement}>
        −
      </Button>
      <Button variant="outline" onClick={increment}>
        +
      </Button>
      <Button variant="outline" onClick={reset}>
        reset
      </Button>
      <Button variant="outline" onClick={() => set(seatLimit)}>
        set({seatLimit})
      </Button>
    </div>
  );
}

const meta = {
  title: "Hooks/useCounter",
  component: Demo,
  tags: ["autodocs"],
} satisfies Meta<typeof Demo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
