// Derived from hooks-ts useCounter.ts @ 9bd12431bb24b84d211f0d735c6bef79fe1be85a (hooks-ts@0.12.0), MIT © 2024 Michał Worwąg — see LICENSE-hooks-ts
import { useState } from "react";

type UseCounterReturn = {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  set: (value: number) => void;
};

/**
 * Numeric counter with increment, decrement, reset and a direct setter.
 *
 * @example
 * const { count, increment, decrement, reset } = useCounter(1);
 *
 * <span>{count}</span>;
 * <Button onClick={increment}>+</Button>;
 * <Button onClick={decrement}>-</Button>;
 * <Button onClick={reset}>Đặt lại</Button>;
 */
export function useCounter(initialValue = 0): UseCounterReturn {
  const [count, setCount] = useState(initialValue);

  const increment = () => setCount((prev) => prev + 1);
  const decrement = () => setCount((prev) => prev - 1);
  const reset = () => setCount(initialValue);
  const set = (value: number) => setCount(value);

  return { count, increment, decrement, reset, set };
}
