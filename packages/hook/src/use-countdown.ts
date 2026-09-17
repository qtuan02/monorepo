// Derived from hooks-ts useCountdown.ts @ 9bd12431bb24b84d211f0d735c6bef79fe1be85a (hooks-ts@0.12.0), MIT © 2024 Michał Worwąg — see LICENSE-hooks-ts
import { useEffect, useState } from "react";

/** Counts down from an initial number of seconds once per second, with a reset. */
export function useCountdown(initialSeconds: number): [number, () => void] {
  const [timeLeft, setTimeLeft] = useState<number>(initialSeconds);

  const reset = () => setTimeLeft(initialSeconds);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const intervalId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft]);

  return [timeLeft, reset];
}
