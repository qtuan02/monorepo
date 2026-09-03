// Hook Usage Examples Registry
import type { ComponentType } from "react";

// Import preview components
import UseCopyToClipboardPreview from "../components/previews/hooks/use-copy-to-clipboard-preview";
// Import source code as raw strings using Vite's ?raw suffix
import useCopyToClipboardPreviewCode from "../components/previews/hooks/use-copy-to-clipboard-preview.tsx?raw";
import UseCountdownPreview from "../components/previews/hooks/use-countdown-preview";
import useCountdownPreviewCode from "../components/previews/hooks/use-countdown-preview.tsx?raw";
import UseDebouncePreview from "../components/previews/hooks/use-debounce-preview";
import useDebouncePreviewCode from "../components/previews/hooks/use-debounce-preview.tsx?raw";
import UseFetchPreview from "../components/previews/hooks/use-fetch-preview";
import useFetchPreviewCode from "../components/previews/hooks/use-fetch-preview.tsx?raw";
import UseHoverPreview from "../components/previews/hooks/use-hover-preview";
import useHoverPreviewCode from "../components/previews/hooks/use-hover-preview.tsx?raw";
import UseIsClientPreview from "../components/previews/hooks/use-is-client-preview";
import useIsClientPreviewCode from "../components/previews/hooks/use-is-client-preview.tsx?raw";
import UseIsMobilePreview from "../components/previews/hooks/use-is-mobile-preview";
import useIsMobilePreviewCode from "../components/previews/hooks/use-is-mobile-preview.tsx?raw";
import UseIsomorphicLayoutEffectPreview from "../components/previews/hooks/use-isomorphic-layout-effect-preview";
import useIsomorphicLayoutEffectPreviewCode from "../components/previews/hooks/use-isomorphic-layout-effect-preview.tsx?raw";
import UseLocalStoragePreview from "../components/previews/hooks/use-local-storage-preview";
import useLocalStoragePreviewCode from "../components/previews/hooks/use-local-storage-preview.tsx?raw";
import UseMediaQueryPreview from "../components/previews/hooks/use-media-query-preview";
import useMediaQueryPreviewCode from "../components/previews/hooks/use-media-query-preview.tsx?raw";
import UseNetworkStatusPreview from "../components/previews/hooks/use-network-status-preview";
import useNetworkStatusPreviewCode from "../components/previews/hooks/use-network-status-preview.tsx?raw";
import UseOnScreenPreview from "../components/previews/hooks/use-on-screen-preview";
import useOnScreenPreviewCode from "../components/previews/hooks/use-on-screen-preview.tsx?raw";
import UseThrottlePreview from "../components/previews/hooks/use-throttle-preview";
import useThrottlePreviewCode from "../components/previews/hooks/use-throttle-preview.tsx?raw";
import UseTimeoutPreview from "../components/previews/hooks/use-timeout-preview";
import useTimeoutPreviewCode from "../components/previews/hooks/use-timeout-preview.tsx?raw";

export interface HookPreview {
  component: ComponentType;
  code: string;
}

export const hookPreviews: Record<string, HookPreview> = {
  "use-copy-to-clipboard": {
    component: UseCopyToClipboardPreview,
    code: useCopyToClipboardPreviewCode,
  },
  "use-countdown": {
    component: UseCountdownPreview,
    code: useCountdownPreviewCode,
  },
  "use-debounce": {
    component: UseDebouncePreview,
    code: useDebouncePreviewCode,
  },
  "use-fetch": {
    component: UseFetchPreview,
    code: useFetchPreviewCode,
  },
  "use-hover": {
    component: UseHoverPreview,
    code: useHoverPreviewCode,
  },
  "use-is-client": {
    component: UseIsClientPreview,
    code: useIsClientPreviewCode,
  },
  "use-is-mobile": {
    component: UseIsMobilePreview,
    code: useIsMobilePreviewCode,
  },
  "use-isomorphic-layout-effect": {
    component: UseIsomorphicLayoutEffectPreview,
    code: useIsomorphicLayoutEffectPreviewCode,
  },
  "use-local-storage": {
    component: UseLocalStoragePreview,
    code: useLocalStoragePreviewCode,
  },
  "use-media-query": {
    component: UseMediaQueryPreview,
    code: useMediaQueryPreviewCode,
  },
  "use-network-status": {
    component: UseNetworkStatusPreview,
    code: useNetworkStatusPreviewCode,
  },
  "use-on-screen": {
    component: UseOnScreenPreview,
    code: useOnScreenPreviewCode,
  },
  "use-throttle": {
    component: UseThrottlePreview,
    code: useThrottlePreviewCode,
  },
  "use-timeout": {
    component: UseTimeoutPreview,
    code: useTimeoutPreviewCode,
  },
};
