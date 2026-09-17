import type { Meta, StoryObj } from "@storybook/react";

import { useToggle } from "@monorepo/hook/use-toggle";
import { Button } from "@monorepo/ui/components/button";
import { Switch } from "@monorepo/ui/components/switch";

function Demo() {
  const [isOn, toggle] = useToggle(false);

  return (
    <div className="flex items-center gap-3">
      <Switch checked={isOn} onCheckedChange={(checked) => toggle(checked)} />
      <span className="text-sm">{isOn ? "on" : "off"}</span>
      <Button variant="outline" onClick={() => toggle()}>
        toggle()
      </Button>
    </div>
  );
}

const meta = {
  title: "Hooks/useToggle",
  component: Demo,
  tags: ["autodocs"],
} satisfies Meta<typeof Demo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
