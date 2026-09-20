import type { ReactNode } from "react";

import { GlassPanel } from "~/components/panel/glass-panel";

interface DocsSectionProps {
  /**
   * The section's place in its page, one-based, and how many the page has —
   * rendered as the `01 / 04` kicker. Both or neither: a page that is one
   * stack of numbered panels (Getting Started) passes them, a page whose
   * sections stand alone (a detail page) does not.
   */
  index?: number;
  total?: number;
  title: string;
  description?: string;
  children: ReactNode;
}

/** `1` → `01`, so the kickers of a page line up in the mono face. */
function padIndex(value: number) {
  return String(value).padStart(2, "0");
}

/**
 * One block of a documentation page, as a glass panel (glossary: *Panel
 * kính*): a left column with the kicker, the heading and a sentence, a right
 * column with whatever renders the point — a snippet, a list, a grid. One
 * column below `lg`, where the two would fight for width or force the code
 * column to scroll. Every page here is a stack of these, which is what keeps
 * the templates readable.
 */
export function DocsSection({
  index,
  total,
  title,
  description,
  children,
}: DocsSectionProps) {
  const numbered = index !== undefined && total !== undefined;

  return (
    <GlassPanel
      as="section"
      className="grid gap-6 px-5 py-6 sm:px-7 sm:py-7 lg:grid-cols-[260px_1fr] lg:gap-7"
    >
      <div>
        {numbered ? (
          <p
            data-slot="docs-section-kicker"
            className="text-primary font-mono text-xs font-semibold tracking-[0.06em]"
          >
            {padIndex(index)} / {padIndex(total)}
          </p>
        ) : null}
        <h2 className="font-heading mt-1.5 text-2xl font-semibold tracking-[-0.03em]">
          {title}
        </h2>
        {description ? (
          <p className="text-muted-foreground mt-2 max-w-prose text-base">
            {description}
          </p>
        ) : null}
      </div>
      <div className="min-w-0 space-y-4">{children}</div>
    </GlassPanel>
  );
}
