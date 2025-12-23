// Hook Usage Examples Registry
import type { ComponentType } from "react";

import UseCopyToClipboardDemo from "../components/demos/hooks/use-copy-to-clipboard-demo";
import useCopyToClipboardDemoCode from "../components/demos/hooks/use-copy-to-clipboard-demo.tsx?raw";
// Import demo components
import UseDebounceDemo from "../components/demos/hooks/use-debounce-demo";
// Import source code as raw strings using Vite's ?raw suffix
import useDebounceDemoCode from "../components/demos/hooks/use-debounce-demo.tsx?raw";
import UseIsMobileDemo from "../components/demos/hooks/use-is-mobile-demo";
import useIsMobileDemoCode from "../components/demos/hooks/use-is-mobile-demo.tsx?raw";
import UseLocalStorageDemo from "../components/demos/hooks/use-local-storage-demo";
import useLocalStorageDemoCode from "../components/demos/hooks/use-local-storage-demo.tsx?raw";

export interface HookExample {
  component: ComponentType;
  code: string;
}

export const hookExamples: Record<string, HookExample> = {
  "use-debounce": {
    component: UseDebounceDemo,
    code: useDebounceDemoCode,
  },
  "use-local-storage": {
    component: UseLocalStorageDemo,
    code: useLocalStorageDemoCode,
  },
  "use-copy-to-clipboard": {
    component: UseCopyToClipboardDemo,
    code: useCopyToClipboardDemoCode,
  },
  "use-is-mobile": {
    component: UseIsMobileDemo,
    code: useIsMobileDemoCode,
  },
};
