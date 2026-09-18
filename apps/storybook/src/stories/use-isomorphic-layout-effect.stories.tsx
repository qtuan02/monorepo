import type { Meta, StoryObj } from "@storybook/react";
import { useRef, useState } from "react";

import { useIsomorphicLayoutEffect } from "@monorepo/hook/use-isomorphic-layout-effect";

// Measured in a layout effect, so the number is on screen in the same paint
// as the box — no frame where it reads 0. On a server the hook is a plain
// `useEffect` instead of a warning.
function Demo() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useIsomorphicLayoutEffect(() => {
    setWidth(ref.current?.getBoundingClientRect().width ?? 0);
  }, []);

  return (
    <div ref={ref} className="bg-muted rounded-md p-4 text-sm">
      This box measured itself at <code>{Math.round(width)}px</code> wide before
      the first paint.
    </div>
  );
}

const meta = {
  title: "Hooks/useIsomorphicLayoutEffect",
  component: Demo,
  tags: ["autodocs"],
} satisfies Meta<typeof Demo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
