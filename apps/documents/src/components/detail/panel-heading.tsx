import type { ReactNode } from "react";

/** The small mono kicker every panel of a detail page opens with — "IMPORT", "EXPORT · 10". */
export function PanelHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-primary mb-3.5 font-mono text-xs font-semibold tracking-wider uppercase">
      {children}
    </h2>
  );
}
