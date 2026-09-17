import { ExternalLink } from "lucide-react";

import { buttonVariants } from "@monorepo/ui/components/button";
import { cn } from "@monorepo/ui/utils/cn";

import { env } from "~/env";

interface StorybookLinkProps {
  /** The docs id the generator derived, e.g. `storybook-button`. */
  docsId: string;
  children: string;
  /** `outline` by default; the detail hero renders it as the solid action. */
  variant?: NonNullable<Parameters<typeof buttonVariants>[0]>["variant"];
  className?: string;
}

/**
 * The demo link every primitive page carries. The page embeds one story as
 * its example (`detail-example.tsx`); the variants and the real props table
 * stay on Storybook's docs page, which this opens — duplicating them here
 * would be 63 hand-written previews to keep in step with the package.
 *
 * A plain `<a>` styled with `buttonVariants`, not `<Button render={...}>`: Base
 * UI's Button assumes a native `<button>` and would either warn on every render
 * or stamp `role="button"` over the anchor's link role.
 */
export function StorybookLink({
  docsId,
  children,
  variant = "outline",
  className,
}: StorybookLinkProps) {
  const href = `${env.PUBLIC_DOCUMENTS_STORYBOOK_URL}/?path=/docs/${docsId}--docs`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(buttonVariants({ variant }), className)}
    >
      <ExternalLink className="size-4" />
      {children}
    </a>
  );
}
