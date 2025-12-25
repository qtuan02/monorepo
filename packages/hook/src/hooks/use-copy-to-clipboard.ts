import { useState } from "react";

type CopiedValueType = string | null;

/**
 * Provides a simple way to copy text to the clipboard.
 */
export function useCopyToClipboard(): [
  CopiedValueType,
  (text: string) => Promise<void>,
] {
  const [copiedText, setCopiedText] = useState<CopiedValueType>(null);

  const copy = async (text: string): Promise<void> => {
    if (!navigator?.clipboard) {
      console.warn("Clipboard not supported");
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
    } catch (error) {
      console.log("Error", error);
      setCopiedText(null);
    }
  };

  return [copiedText, copy];
}
