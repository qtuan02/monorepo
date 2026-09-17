import type { Meta, StoryObj } from "@storybook/react";

import { useLocalStorage } from "@monorepo/hook/use-local-storage";
import { Input } from "@monorepo/ui/components/input";

function Demo() {
  const [name, setName] = useLocalStorage<string>(
    "storybook-use-local-storage",
    "",
  );

  return (
    <div className="flex max-w-sm flex-col gap-3">
      <Input
        value={name}
        placeholder="Your name"
        onChange={(event) => setName(event.target.value)}
      />
      <p className="text-muted-foreground text-sm">
        Reload the page — <code>{name}</code> is still here.
      </p>
    </div>
  );
}

const meta = {
  title: "Hooks/useLocalStorage",
  component: Demo,
  tags: ["autodocs"],
} satisfies Meta<typeof Demo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
