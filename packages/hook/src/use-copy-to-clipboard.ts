// Derived from hooks-ts useCopyToClipboard.ts @ 9bd12431bb24b84d211f0d735c6bef79fe1be85a (hooks-ts@0.12.0), MIT © 2024 Michał Worwąg — see LICENSE-hooks-ts
import { useState } from "react";

type CopiedValueType = string | null;

/**
 * `[copiedText, copy]` — `copiedText` is the text after a successful copy,
 * `null` after a failed one; `copy` only warns when the Clipboard API is
 * unavailable.
 *
 * @example
 * const [copiedText, copy] = useCopyToClipboard();
 *
 * <Button onClick={() => void copy(snippet)}>
 *   {copiedText === snippet ? "Copied" : "Copy"}
 * </Button>;
 */
export const useCopyToClipboard = (): [
  CopiedValueType,
  (text: string) => Promise<void>,
] => {
  const [copiedText, setCopiedText] = useState<CopiedValueType>(null);

  const copy = async (text: string): Promise<void> => {
    if (!navigator?.clipboard) {
      console.warn("Clipboard not supported");
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
    } catch {
      setCopiedText(null);
    }
  };

  return [copiedText, copy];
};
