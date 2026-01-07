# @fe-monorepo/hook

A collection of reusable React hooks for common functionality.

## Installation

```bash
npm install @fe-monorepo/hook
# or
pnpm add @fe-monorepo/hook
# or
yarn add @fe-monorepo/hook
```

## Prerequisites

- **React** 19 or higher

## Usage

Import hooks from the package:

```tsx
import {
  useDebounce,
  useIsClient,
  useLocalStorage,
  useMediaQuery,
} from "@fe-monorepo/hook";

function MyComponent() {
  const isClient = useIsClient();
  const [value, setValue] = useState("");
  const debouncedValue = useDebounce(value, 500);
  const [stored, setStored] = useLocalStorage("key", "default");

  // ...
}
```

### Import Individual Hooks

You can also import hooks individually:

```tsx
import { useDebounce } from "@fe-monorepo/hook/hooks/use-debounce";
import { useLocalStorage } from "@fe-monorepo/hook/hooks/use-local-storage";
```

## Available Hooks

### Client-side Hooks

- `useIsClient` - Detects if code is running on the client
- `useIsMobile` - Detects mobile devices
- `useIsomorphicLayoutEffect` - SSR-safe layout effect hook
- `useMediaQuery` - Responsive media query hook
- `useOnScreen` - Intersection Observer hook
- `useNetworkStatus` - Network connectivity status

### Utility Hooks

- `useCopyToClipboard` - Copy text to clipboard
- `useCountdown` - Countdown timer
- `useDebounce` - Debounce values
- `useThrottle` - Throttle values
- `useTimeout` - Timeout hook
- `useHover` - Hover state detection
- `useLocalStorage` - Local storage with React state
- `useFetch` - Data fetching hook

## Type Safety

All hooks are fully typed with TypeScript. Types are exported and can be used in your components.

## License

MIT
