import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { useTimeout } from "@monorepo/hook/use-timeout";
import { Badge } from "@monorepo/ui/components/badge";
import { Button } from "@monorepo/ui/components/button";

import { atlasProject as atlas } from "~/support/projects";

function Demo() {
  const [posted, setPosted] = useState(false);

  useTimeout(() => setPosted(false), posted ? 2000 : null);

  return (
    <div className="flex items-center gap-4">
      <Button variant="outline" onClick={() => setPosted(true)}>
        Post comment on {atlas.name}
      </Button>
      {posted && <Badge>Posted</Badge>}
    </div>
  );
}

const meta = {
  title: "Hooks/useTimeout",
  component: Demo,
  tags: ["autodocs"],
} satisfies Meta<typeof Demo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
