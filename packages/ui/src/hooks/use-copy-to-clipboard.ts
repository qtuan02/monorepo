import { useCallback, useEffect, useRef, useState } from "react";

type CopiedValue = string | null;

type CopyFn = (text: string) => Promise<boolean>;

function useCopyToClipboard(delay = 1500) {
  const [copiedText, setCopiedText] = useState<CopiedValue>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy: CopyFn = useCallback(
    async (text) => {
      if (!navigator.clipboard) {
        console.warn("Clipboard not supported");
        return false;
      }

      try {
        await navigator.clipboard.writeText(text);
        setCopiedText(text);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
          setCopiedText(null);
        }, delay);

        return true;
      } catch (error) {
        console.warn("Copy failed", error);
        setCopiedText(null);
        return false;
      }
    },
    [delay],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return {
    copied: !!copiedText,
    copiedText,
    copy,
  };
}

export default useCopyToClipboard;
