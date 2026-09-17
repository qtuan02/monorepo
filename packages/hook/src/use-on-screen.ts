// Derived from hooks-ts useOnScreen.ts @ 9bd12431bb24b84d211f0d735c6bef79fe1be85a (hooks-ts@0.12.0), MIT © 2024 Michał Worwąg — see LICENSE-hooks-ts
import type { RefObject } from "react";
import { useEffect, useState } from "react";

/**
 * Reports whether `ref`'s element is inside the viewport, via an
 * `IntersectionObserver` created in an effect.
 *
 * @example
 * const sentinelRef = useRef<HTMLDivElement>(null);
 * const isVisible = useOnScreen(sentinelRef, "200px");
 *
 * useEffect(() => {
 *   if (isVisible) fetchNextPage();
 * }, [isVisible]);
 */
export function useOnScreen(
  ref: RefObject<Element | null>,
  rootMargin: string = "0px",
): boolean {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (ref.current == null) return;
    const currentRef = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry?.isIntersecting ?? false),
      { rootMargin },
    );
    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [ref, rootMargin]);

  return isVisible;
}
