import type { Meta, StoryObj } from "@storybook/react";

import { useDarkMode } from "@monorepo/hook/use-dark-mode";
import { Button } from "@monorepo/ui/components/button";

// `className: "dark"` is the class the workspace theme reads, so the toggle
// flips this very preview; the key keeps the choice apart from anything else.
function Demo() {
  const [isDarkMode, toggle] = useDarkMode({
    className: "dark",
    storageKey: "storybook-use-dark-mode",
  });

  return (
    <div className="bg-background text-foreground flex items-center gap-4 rounded-md border p-4">
      <span className="text-sm">
        {isDarkMode ? "dark" : "light"} — the whole preview follows the hook
      </span>
      <Button variant="outline" onClick={toggle}>
        Toggle
      </Button>
    </div>
  );
}

const meta = {
  title: "Hooks/useDarkMode",
  component: Demo,
  tags: ["autodocs"],
} satisfies Meta<typeof Demo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
