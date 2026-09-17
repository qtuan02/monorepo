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
  argTypes: {
    direction: {
      control: "select",
      options: ["ltr", "rtl"],
    },
  },
} satisfies Meta<typeof DirectionProvider>;

export default meta;

type Story = StoryObj<typeof meta>;

// Reads the LIVE context DirectionProvider provides, rather than the args value directly —
// so the `direction` control on the Docs page re-renders this without a custom `render`.
function DirectionDemo() {
  const direction = useDirection();
  return (
    <div dir={direction} className="flex flex-col items-start gap-2">
      <span className="text-xs text-muted-foreground">
        Current direction: {direction}
      </span>
      <Button>
        Continue
        <ArrowRightIcon />
      </Button>
    </div>
  );
}

export const Default: Story = {
  args: {
    direction: "rtl",
    children: <DirectionDemo />,
  },
};
