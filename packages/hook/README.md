# @monorepo/hook

Shared React hooks package for common functionality across the monorepo.

## Overview

This package provides reusable React hooks that can be used across all applications in the monorepo. All hooks are built with TypeScript and follow React best practices.

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

## Usage

```typescript
import { useDebounce, useIsClient, useLocalStorage } from "@monorepo/hook";

function MyComponent() {
  const isClient = useIsClient();
  const [value, setValue] = useState("");
  const debouncedValue = useDebounce(value, 500);
  const [stored, setStored] = useLocalStorage("key", "default");

  // ...
}
```

## Hook Details

### `useIsClient`

Detects if code is running in the browser (client-side).

```typescript
const isClient = useIsClient();
if (isClient) {
  // Client-side only code
}
```

### `useIsMobile`

Detects if the device is mobile.

```typescript
const isMobile = useIsMobile();
```

### `useIsomorphicLayoutEffect`

Returns the appropriate layout effect hook based on environment. Uses `useLayoutEffect` in browser and `useEffect` on server.

```typescript
const useIsomorphicLayoutEffect = useIsomorphicLayoutEffect();
useIsomorphicLayoutEffect(() => {
  // Safe for SSR
}, []);
```

### `useDebounce`

Debounces a value with a delay.

```typescript
const [search, setSearch] = useState("");
const debouncedSearch = useDebounce(search, 500);
```

### `useLocalStorage`

Synchronizes state with localStorage.

```typescript
const [value, setValue] = useLocalStorage("key", "default");
```

### `useMediaQuery`

Matches a media query string.

```typescript
const isDesktop = useMediaQuery("(min-width: 1024px)");
```

### `useOnScreen`

Detects if an element is visible on screen.

```typescript
const ref = useRef(null);
const isVisible = useOnScreen(ref);
```

### `useNetworkStatus`

Tracks network connectivity.

```typescript
const { online, offline } = useNetworkStatus();
```

## Type Safety

All hooks are fully typed with TypeScript. Types are exported and can be used in your components.

## Dependencies

- `react-dom` - React DOM for client-side hooks

## Best Practices

1. **Use appropriate hooks**: Choose hooks that match your use case
2. **SSR compatibility**: Use `useIsClient` or `useIsomorphicLayoutEffect` for SSR-safe code
3. **Performance**: Use `useDebounce` and `useThrottle` for expensive operations
4. **Type safety**: Leverage TypeScript types for better DX
