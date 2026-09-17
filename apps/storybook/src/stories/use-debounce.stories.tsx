import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { useDebounce } from "@monorepo/hook/use-debounce";
import { Input } from "@monorepo/ui/components/input";

function Demo() {
  const [text, setText] = useState("");
  const debouncedText = useDebounce(text, 500);

  return (
    <div className="flex max-w-sm flex-col gap-3">
      <Input
        value={text}
        placeholder="Type quickly…"
        onChange={(event) => setText(event.target.value)}
      />
      <p className="text-muted-foreground text-sm">
        Immediate: <code>{text || "—"}</code>
      </p>
      <p className="text-sm">
        Debounced (500ms): <code>{debouncedText || "—"}</code>
      </p>
    </div>
  );
}

const meta = {
  title: "Hooks/useDebounce",
  component: Demo,
  tags: ["autodocs"],
} satisfies Meta<typeof Demo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
