import type { Preview } from "@storybook/react";
import { useEffect } from "react";

import { Toaster } from "@monorepo/ui/components/toast";
import { TooltipProvider } from "@monorepo/ui/components/tooltip";
import { cn } from "@monorepo/ui/utils/cn";

import "../src/globals.css";

export type StageWidth = "sm" | "md" | "lg" | "full";

// Extends Storybook's own `Parameters` (an interface with a `[name: string]:
// any` index signature) so `parameters.stage.width` is checked against this
// scale rather than accepting any string. @storybook/react-vite re-exports the
// same interface from @storybook/react (`export * from "@storybook/react"`),
// so the merge reaches every story file regardless of which of the two it
// imports `Meta`/`StoryObj` from.
declare module "@storybook/react" {
  interface Parameters {
    stage?: {
      width?: StageWidth;
    };
  }
}

const STAGE_WIDTH_CLASSES: Record<StageWidth, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  full: "max-w-none",
};

// The min-height leaves only a thin rim of `bg-background` around the stage —
// sized so the stage fills most of the 320px-tall iframe `documents` embeds
// `Default` in (`h-80` there).
function Stage({
  width,
  children,
}: {
  width: StageWidth;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background p-3">
      <div
        data-testid="storybook-stage"
        className="flex min-h-72 items-center justify-center rounded-xl border bg-card p-6"
      >
        <div
          data-testid="storybook-stage-content"
          className={cn("w-full", STAGE_WIDTH_CLASSES[width])}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

// Syncs onto `documentElement` rather than a wrapper div: the theme's dark
// variant is `:where(.dark, .dark *)` (tooling/tailwind/theme.css), so only the
// root class reaches a Dialog/Popover/Tooltip/Toast portalled to `body`. An
// effect is correct here per react-effects-sync-only — this synchronizes React
// state to an external system (the document).
function ThemeSync({ theme }: { theme: string }) {
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return null;
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: ["Introduction", "Storybook", "Hooks"],
      },
    },
  },
  globalTypes: {
    theme: {
      description: "Theme",
      toolbar: {
        icon: "sun",
        items: [
          { value: "light", title: "Light", icon: "sun" },
          { value: "dark", title: "Dark", icon: "moon" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: "light",
  },
  decorators: [
    (Story, { globals, parameters }) => {
      const theme = typeof globals.theme === "string" ? globals.theme : "light";
      const content = (
        <TooltipProvider>
          <ThemeSync theme={theme} />
          <Toaster />
          <Story />
        </TooltipProvider>
      );

      if (parameters.layout === "fullscreen") {
        return content;
      }

      return <Stage width={parameters.stage?.width ?? "md"}>{content}</Stage>;
    },
  ],
};

export default preview;
