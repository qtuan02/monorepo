/**
 * Captures a deep clone of `target` right now — at the mock module's own
 * load time, before any mutation could reach it — and returns a function
 * that restores `target` to that snapshot in place. In place matters: every
 * `~/hooks/api/*` mutation holds the same array reference, so a reset must
 * not replace it, only rewrite its contents (spec #153 §10 row 23, "Khôi
 * phục dữ liệu mẫu").
 */
export function trackMockReset<T>(target: T[]): () => void {
  const initial = structuredClone(target);
  return () => {
    target.length = 0;
    target.push(...structuredClone(initial));
  };
}
