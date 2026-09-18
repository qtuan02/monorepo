// Derived from hooks-ts useNetworkStatus.ts @ 9bd12431bb24b84d211f0d735c6bef79fe1be85a (hooks-ts@0.12.0), MIT © 2024 Michał Worwąg — see LICENSE-hooks-ts
// patched: fixed `isServer`'s inverted check (upstream's `typeof window === "undefined"` names the server case then treats it as the browser one, so a browser render never read `navigator.onLine`); the effect now returns early when there is no `window`
import { useEffect, useState } from "react";

/**
 * `navigator.onLine`, kept live by the `online`/`offline` window events.
 * Renders `true` with no `window` — the "assume connected" default a server
 * render is safe to send, matched by the effect doing nothing there instead
 * of reaching for a `window` that does not exist.
 *
 * @example
 * const isOnline = useNetworkStatus();
 *
 * return isOnline ? <SyncIndicator /> : <OfflineBanner />;
 */
export function useNetworkStatus(): boolean {
  const isServer = typeof window === "undefined";
  const [isOnline, setIsOnline] = useState(
    isServer ? true : window.navigator.onLine,
  );

  useEffect(() => {
    if (isServer) return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [isServer]);

  return isOnline;
}
