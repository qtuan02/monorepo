import type { Meta, StoryObj } from "@storybook/react";

import { useCopyToClipboard } from "@monorepo/hook/use-copy-to-clipboard";
import { Button } from "@monorepo/ui/components/button";

const SNIPPET = 'import { Button } from "@fe-monorepo/ui/components/button";';

function Demo() {
  const [copiedText, copy] = useCopyToClipboard();

  return (
    <div className="flex max-w-lg flex-col items-start gap-3">
      <code className="bg-muted rounded-md px-2 py-1 text-sm">{SNIPPET}</code>
      <Button variant="outline" onClick={() => void copy(SNIPPET)}>
        {copiedText === SNIPPET ? "Copied!" : "Copy"}
      </Button>
    </div>
  );
}

const meta = {
  title: "Hooks/useCopyToClipboard",
  component: Demo,
  tags: ["autodocs"],
} satisfies Meta<typeof Demo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
