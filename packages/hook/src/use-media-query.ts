// Derived from hooks-ts useMediaQuery.ts @ 9bd12431bb24b84d211f0d735c6bef79fe1be85a (hooks-ts@0.12.0), MIT © 2024 Michał Worwąg — see LICENSE-hooks-ts
import { useEffect, useState } from "react";

/**
 * Subscribes to a CSS media query. `false` on the first frame, server and
 * client alike, then the real match from an effect — so it never
 * hydration-mismatches.
 *
 * @example
 * const isWide = useMediaQuery("(min-width: 1024px)");
 *
 * return isWide ? <SidebarLayout /> : <StackedLayout />;
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const documentChangeHandler = () => setMatches(mediaQueryList.matches);

    // Set the initial state
    setMatches(mediaQueryList.matches);

    // Listen for changes
    mediaQueryList.addEventListener("change", documentChangeHandler);

    // Cleanup listener on unmount
    return () => {
      mediaQueryList.removeEventListener("change", documentChangeHandler);
    };
  }, [query]);

  return matches;
}
