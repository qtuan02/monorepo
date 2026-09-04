import type { Meta, StoryObj } from "@storybook/react";
import { ArrowRightIcon } from "lucide-react";

import { Button } from "@monorepo/ui/components/button";
import {
  DirectionProvider,
  useDirection,
} from "@monorepo/ui/components/direction";

const meta = {
  title: "Storybook/DirectionProvider",
  component: DirectionProvider,
  tags: ["autodocs"],
} satisfies Meta<typeof DirectionProvider>;

export default meta;

type Story = StoryObj<typeof meta>;

function DirectionLabel() {
  const direction = useDirection();
  return (
    <span className="text-xs text-muted-foreground">
      Current direction: {direction}
    </span>
  );
}

export const Default: Story = {
  args: {},
  render: () => (
    <div className="flex gap-8">
      <DirectionProvider direction="ltr">
        <div dir="ltr" className="flex flex-col items-start gap-2">
          <DirectionLabel />
          <Button>
            Next
            <ArrowRightIcon />
          </Button>
        </div>
      </DirectionProvider>
      <DirectionProvider direction="rtl">
        <div dir="rtl" className="flex flex-col items-start gap-2">
          <DirectionLabel />
          <Button>
            Tiếp theo
            <ArrowRightIcon />
          </Button>
        </div>
      </DirectionProvider>
    </div>
  ),
};
