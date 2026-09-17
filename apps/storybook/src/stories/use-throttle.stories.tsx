import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { useThrottle } from "@monorepo/hook/use-throttle";
import { Input } from "@monorepo/ui/components/input";

function Demo() {
  const [text, setText] = useState("");
  const throttledText = useThrottle(text, 1000);

  return (
    <div className="flex max-w-sm flex-col gap-3">
      <Input
        value={text}
        placeholder="Type continuously…"
        onChange={(event) => setText(event.target.value)}
      />
      <p className="text-muted-foreground text-sm">
        Immediate: <code>{text || "—"}</code>
      </p>
      <p className="text-sm">
        Throttled (at most once per 1000ms): <code>{throttledText || "—"}</code>
      </p>
    </div>
  );
}

const meta = {
  title: "Hooks/useThrottle",
  component: Demo,
  tags: ["autodocs"],
} satisfies Meta<typeof Demo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
