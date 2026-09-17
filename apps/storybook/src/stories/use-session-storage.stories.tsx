import type { Meta, StoryObj } from "@storybook/react";

import { useSessionStorage } from "@monorepo/hook/use-session-storage";
import { Button } from "@monorepo/ui/components/button";
import { Input } from "@monorepo/ui/components/input";

function Demo() {
  const [draft, setDraft, removeDraft] = useSessionStorage<string>(
    "storybook-use-session-storage",
    "",
  );

  return (
    <div className="flex max-w-sm flex-col gap-3">
      <Input
        value={draft}
        placeholder="A draft that survives a reload, not a new tab"
        onChange={(event) => setDraft(event.target.value)}
      />
      <Button variant="outline" className="self-start" onClick={removeDraft}>
        Remove
      </Button>
    </div>
  );
}

const meta = {
  title: "Hooks/useSessionStorage",
  component: Demo,
  tags: ["autodocs"],
} satisfies Meta<typeof Demo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
