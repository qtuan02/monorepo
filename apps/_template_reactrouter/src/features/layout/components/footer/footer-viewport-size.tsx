import { useEffect, useState } from "react";

/**
 * The live window size — the fastest way to reproduce a layout report, since the
 * breakpoint the user is actually on is the first thing a bug needs. Kept out of
 * FooterTemplate so a drag-resize re-renders this readout alone.
 *
 * The Vite Template seeds this straight from `window.innerWidth`. Here that is
 * not a mismatch, it is a crash: there is no `window` during the server render,
 * so the initializer would throw and take the whole response with it. Hence
 * `null` until mounted, with the first read moved inside the effect — the same
 * shape as the header clock, for a harder reason.
 */
export default function FooterViewportSize() {
  const [size, setSize] = useState<{ width: number; height: number } | null>(
    null,
  );

  // A genuine external-system sync: the window's size lives outside React, so a
  // listener is the only way to follow it. Cleaned up on unmount.
  useEffect(() => {
    const handleResize = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!size) {
    return null;
  }

  return (
    <>
      {/* The divider belongs to this readout rather than to FooterBuildInfo, so
          the row does not end in a dangling separator on the server render. */}
      <span aria-hidden="true" className="bg-border h-3 w-px" />
      <span className="tabular-nums">
        {getViewportLabel(size.width)} {size.width}×{size.height}
      </span>
    </>
  );
}

/**
 * Deliberately untranslated: this reads back to whoever is triaging the report,
 * and the cut-offs are Tailwind's own `sm` / `lg` — so the label names the same
 * band the styles branch on.
 */
export function getViewportLabel(width: number) {
  if (width < 640) return "Mobile";
  if (width < 1024) return "Tablet";

  return "Window";
}
