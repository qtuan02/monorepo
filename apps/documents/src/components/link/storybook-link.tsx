import { ExternalLink } from "lucide-react";

import { buttonVariants } from "@monorepo/ui/components/button";
import { cn } from "@monorepo/ui/utils/cn";

import { env } from "~/env";

interface StorybookLinkProps {
  /** The docs id the generator derived, e.g. `storybook-button`. */
  docsId: string;
  children: string;
  className?: string;
}

/**
 * The demo link every primitive page ends with. This site renders no live
 * preview of its own — Storybook already renders every primitive with its
 * variants and a real props table, so duplicating that here would be 63
 * hand-written previews to keep in step with the package.
 *
 * A plain `<a>` styled with `buttonVariants`, not `<Button render={...}>`: Base
 * UI's Button assumes a native `<button>` and would either warn on every render
 * or stamp `role="button"` over the anchor's link role.
 */
export function StorybookLink({
  docsId,
  children,
  className,
}: StorybookLinkProps) {
  const href = `${env.PUBLIC_DOCUMENTS_STORYBOOK_URL}/?path=/docs/${docsId}--docs`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(buttonVariants({ variant: "outline" }), className)}
    >
      <ExternalLink className="size-4" />
      {children}
    </a>
  );
}
