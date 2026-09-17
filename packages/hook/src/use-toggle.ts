// Derived from hooks-ts useToggle.ts @ 9bd12431bb24b84d211f0d735c6bef79fe1be85a (hooks-ts@0.12.0), MIT © 2024 Michał Worwąg — see LICENSE-hooks-ts
import { useCallback, useState } from "react";

/**
 * Boolean toggle that flips on call, or is forced to an explicit value.
 *
 * @example
 * const [showDetails, toggleDetails] = useToggle(false);
 *
 * <Button onClick={() => toggleDetails()}>{showDetails ? "Ẩn" : "Hiện"} chi tiết</Button>;
 * <Button onClick={() => toggleDetails(false)}>Đóng</Button>;
 */
export function useToggle(
  initialValue = false,
): [boolean, (value?: boolean) => void] {
  const [state, setState] = useState(initialValue);

  const toggle = useCallback((value?: boolean) => {
    setState((current) => (typeof value === "boolean" ? value : !current));
  }, []);

  return [state, toggle];
}
