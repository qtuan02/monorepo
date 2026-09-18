import type { Meta, StoryObj } from "@storybook/react";

import { MOBILE_BREAKPOINT, useIsMobile } from "@monorepo/hook/use-is-mobile";
import { Badge } from "@monorepo/ui/components/badge";

function Demo() {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col items-start gap-2">
      <Badge variant={isMobile ? "default" : "secondary"}>
        {isMobile ? "mobile" : "desktop"}
      </Badge>
      <p className="text-muted-foreground text-sm">
        Resize the viewport past {MOBILE_BREAKPOINT}px to see it flip.
      </p>
    </div>
  );
}

const meta = {
  title: "Hooks/useIsMobile",
  component: Demo,
  tags: ["autodocs"],
} satisfies Meta<typeof Demo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
