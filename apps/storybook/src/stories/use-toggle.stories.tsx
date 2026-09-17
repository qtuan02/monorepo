import type { Meta, StoryObj } from "@storybook/react";

import { useToggle } from "@monorepo/hook/use-toggle";
import { Button } from "@monorepo/ui/components/button";
import { Switch } from "@monorepo/ui/components/switch";

import { atlasProject as atlas } from "~/support/projects";

function Demo() {
  const [notify, toggle] = useToggle(true);

  return (
    <div className="flex items-center gap-3">
      <Switch checked={notify} onCheckedChange={(checked) => toggle(checked)} />
      <span className="text-sm">
        Notify me about {atlas.name} — {notify ? "on" : "off"}
      </span>
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
