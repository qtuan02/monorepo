// Derived from hooks-ts useHover.ts @ 9bd12431bb24b84d211f0d735c6bef79fe1be85a (hooks-ts@0.12.0), MIT © 2024 Michał Worwąg — see LICENSE-hooks-ts
import { useEffect, useState } from "react";

/**
 * Tracks whether the pointer is over the element `elementRef` points at, via
 * `mouseenter`/`mouseleave` listeners attached in an effect.
 *
 * @example
 * const cardRef = useRef<HTMLDivElement>(null);
 * const isHovered = useHover(cardRef);
 *
 * <div ref={cardRef}>{isHovered ? "Đang hover" : "Không hover"}</div>;
 */
export function useHover<T extends HTMLElement>(
  elementRef: React.RefObject<T | null>,
): boolean {
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const element = elementRef.current;

    if (!element) return;

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [elementRef]);

  return isHovered;
}
