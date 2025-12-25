// Hook Usage Examples Registry
import type { ComponentType } from "react";

// Import demo components
import UseCopyToClipboardDemo from "../components/demos/hooks/use-copy-to-clipboard-demo";
// Import source code as raw strings using Vite's ?raw suffix
import useCopyToClipboardDemoCode from "../components/demos/hooks/use-copy-to-clipboard-demo.tsx?raw";
import UseCountdownDemo from "../components/demos/hooks/use-countdown-demo";
import useCountdownDemoCode from "../components/demos/hooks/use-countdown-demo.tsx?raw";
import UseDebounceDemo from "../components/demos/hooks/use-debounce-demo";
import useDebounceDemoCode from "../components/demos/hooks/use-debounce-demo.tsx?raw";
import UseFetchDemo from "../components/demos/hooks/use-fetch-demo";
import useFetchDemoCode from "../components/demos/hooks/use-fetch-demo.tsx?raw";
import UseHoverDemo from "../components/demos/hooks/use-hover-demo";
import useHoverDemoCode from "../components/demos/hooks/use-hover-demo.tsx?raw";
import UseIsClientDemo from "../components/demos/hooks/use-is-client-demo";
import useIsClientDemoCode from "../components/demos/hooks/use-is-client-demo.tsx?raw";
import UseIsMobileDemo from "../components/demos/hooks/use-is-mobile-demo";
import useIsMobileDemoCode from "../components/demos/hooks/use-is-mobile-demo.tsx?raw";
import UseIsomorphicLayoutEffectDemo from "../components/demos/hooks/use-isomorphic-layout-effect-demo";
import useIsomorphicLayoutEffectDemoCode from "../components/demos/hooks/use-isomorphic-layout-effect-demo.tsx?raw";
import UseLocalStorageDemo from "../components/demos/hooks/use-local-storage-demo";
import useLocalStorageDemoCode from "../components/demos/hooks/use-local-storage-demo.tsx?raw";
import UseMediaQueryDemo from "../components/demos/hooks/use-media-query-demo";
import useMediaQueryDemoCode from "../components/demos/hooks/use-media-query-demo.tsx?raw";
import UseNetworkStatusDemo from "../components/demos/hooks/use-network-status-demo";
import useNetworkStatusDemoCode from "../components/demos/hooks/use-network-status-demo.tsx?raw";
import UseOnScreenDemo from "../components/demos/hooks/use-on-screen-demo";
import useOnScreenDemoCode from "../components/demos/hooks/use-on-screen-demo.tsx?raw";
import UseThrottleDemo from "../components/demos/hooks/use-throttle-demo";
import useThrottleDemoCode from "../components/demos/hooks/use-throttle-demo.tsx?raw";
import UseTimeoutDemo from "../components/demos/hooks/use-timeout-demo";
import useTimeoutDemoCode from "../components/demos/hooks/use-timeout-demo.tsx?raw";

export interface HookExample {
  component: ComponentType;
  code: string;
}

export const hookExamples: Record<string, HookExample> = {
  "use-copy-to-clipboard": {
    component: UseCopyToClipboardDemo,
    code: useCopyToClipboardDemoCode,
  },
  "use-countdown": {
    component: UseCountdownDemo,
    code: useCountdownDemoCode,
  },
  "use-debounce": {
    component: UseDebounceDemo,
    code: useDebounceDemoCode,
  },
  "use-fetch": {
    component: UseFetchDemo,
    code: useFetchDemoCode,
  },
  "use-hover": {
    component: UseHoverDemo,
    code: useHoverDemoCode,
  },
  "use-is-client": {
    component: UseIsClientDemo,
    code: useIsClientDemoCode,
  },
  "use-is-mobile": {
    component: UseIsMobileDemo,
    code: useIsMobileDemoCode,
  },
  "use-isomorphic-layout-effect": {
    component: UseIsomorphicLayoutEffectDemo,
    code: useIsomorphicLayoutEffectDemoCode,
  },
  "use-local-storage": {
    component: UseLocalStorageDemo,
    code: useLocalStorageDemoCode,
  },
  "use-media-query": {
    component: UseMediaQueryDemo,
    code: useMediaQueryDemoCode,
  },
  "use-network-status": {
    component: UseNetworkStatusDemo,
    code: useNetworkStatusDemoCode,
  },
  "use-on-screen": {
    component: UseOnScreenDemo,
    code: useOnScreenDemoCode,
  },
  "use-throttle": {
    component: UseThrottleDemo,
    code: useThrottleDemoCode,
  },
  "use-timeout": {
    component: UseTimeoutDemo,
    code: useTimeoutDemoCode,
  },
};
