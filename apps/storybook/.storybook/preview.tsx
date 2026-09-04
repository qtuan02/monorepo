import type { Preview } from "@storybook/react";

import { Toaster } from "@monorepo/ui/components/toast";
import { TooltipProvider } from "@monorepo/ui/components/tooltip";

import "../src/globals.css";

function StoryFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background text-foreground w-full min-w-0 px-6 py-8">
      <div className="flex w-full min-w-0 items-center justify-center">
        {children}
      </div>
    </div>
  );
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: "padded",
  },
  decorators: [
    (Story, { parameters }) => {
      const content = (
        <TooltipProvider>
          <Toaster />
          <Story />
        </TooltipProvider>
      );

      if (parameters.layout === "fullscreen") {
        return content;
      }

      return <StoryFrame>{content}</StoryFrame>;
    },
  ],
};

export default preview;
