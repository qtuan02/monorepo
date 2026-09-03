import type { Preview } from "@storybook/react";
import { ThemeProvider } from "next-themes";

import { Toaster } from "@monorepo/ui";

import "../src/styles.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <Toaster />
        <Story />
      </ThemeProvider>
    ),
  ],
};

export default preview;
