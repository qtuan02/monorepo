import { useEffect, useState } from "react";

/**
 * The live window size — the fastest way to reproduce a layout report, since the
 * breakpoint the user is actually on is the first thing a bug needs. Kept out of
 * FooterTemplate so a drag-resize re-renders this readout alone.
 */
export default function FooterViewportSize() {
  const [size, setSize] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));

  // A genuine external-system sync: the window's size lives outside React, so a
  // listener is the only way to follow it. Cleaned up on unmount.
  useEffect(() => {
    const handleResize = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <span className="tabular-nums">
      {getViewportLabel(size.width)} {size.width}×{size.height}
    </span>
  );
}

/**
 * Deliberately untranslated: this reads back to whoever is triaging the report,
 * and the cut-offs are Tailwind's own `sm` / `lg` — so the label names the same
 * band the styles branch on.
 */
function getViewportLabel(width: number) {
  if (width < 640) return "Mobile";
  if (width < 1024) return "Tablet";

  return "Window";
}
