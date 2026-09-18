import type { Meta, StoryObj } from "@storybook/react";

import { useCopyToClipboard } from "@monorepo/hook/use-copy-to-clipboard";
import { Button } from "@monorepo/ui/components/button";

import { atlasProject as atlas } from "~/support/projects";

const INVITE_LINK = `https://northwind.dev/${atlas.id}/invite`;

function Demo() {
  const [copiedText, copy] = useCopyToClipboard();

  return (
    <div className="flex flex-col items-start gap-3">
      <code className="bg-muted rounded-md px-2 py-1 text-sm">
        {INVITE_LINK}
      </code>
      <Button variant="outline" onClick={() => void copy(INVITE_LINK)}>
        {copiedText === INVITE_LINK ? "Copied!" : "Copy invite link"}
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

export const Default: Story = {
  parameters: {
    stage: { width: "lg" },
  },
};
