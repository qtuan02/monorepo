import type { Meta, StoryObj } from "@storybook/react";

import { useBoolean } from "@monorepo/hook/use-boolean";
import { Badge } from "@monorepo/ui/components/badge";
import { Button } from "@monorepo/ui/components/button";

function Demo() {
  const { value, toggle, setTrue, setFalse } = useBoolean(false);

  return (
    <div className="flex flex-col items-start gap-3">
      <Badge variant={value ? "default" : "secondary"}>
        {value ? "true" : "false"}
      </Badge>
      <div className="flex gap-2">
        <Button variant="outline" onClick={toggle}>
          toggle
        </Button>
        <Button variant="outline" onClick={setTrue}>
          setTrue
        </Button>
        <Button variant="outline" onClick={setFalse}>
          setFalse
        </Button>
      </div>
    </div>
  );
}

const meta = {
  title: "Hooks/useBoolean",
  component: Demo,
  tags: ["autodocs"],
} satisfies Meta<typeof Demo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
