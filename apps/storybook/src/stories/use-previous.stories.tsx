import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { usePrevious } from "@monorepo/hook/use-previous";
import { Button } from "@monorepo/ui/components/button";

import { northwindNotifications } from "~/support/notifications";

const unreadCount = northwindNotifications.filter((n) => !n.read).length;

function Demo() {
  const [count, setCount] = useState(unreadCount);
  const previous = usePrevious(count);

  return (
    <div className="flex items-center gap-4">
      <p className="text-sm">
        unread now <code>{count}</code>, before <code>{previous ?? "—"}</code>
      </p>
      <Button variant="outline" onClick={() => setCount((c) => c + 1)}>
        New notification
      </Button>
    </div>
  );
}

const meta = {
  title: "Hooks/usePrevious",
  component: Demo,
  tags: ["autodocs"],
} satisfies Meta<typeof Demo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
