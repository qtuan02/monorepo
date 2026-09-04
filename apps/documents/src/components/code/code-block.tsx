import { Check, Copy } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useCopyToClipboard } from "@monorepo/hook/use-copy-to-clipboard";
import { Button } from "@monorepo/ui/components/button";
import { cn } from "@monorepo/ui/utils/cn";

interface CodeBlockProps {
  code: string;
  /** Shown above the block when a snippet needs naming (a file path, a shell). */
  caption?: string;
  className?: string;
}

/**
 * A read-only snippet with a copy button — the one way this site renders code.
 *
 * No syntax highlighting and no line numbers: every snippet here is four lines
 * of an import or a shell command, so a highlighter would be a bundle cost paid
 * for nothing. The copy button uses `useCopyToClipboard` from the very package
 * the site documents, which is the cheapest possible proof it works.
 */
export function CodeBlock({ code, caption, className }: CodeBlockProps) {
  const { t } = useTranslation();
  const [copiedText, copy] = useCopyToClipboard();
  const isCopied = copiedText === code;

  return (
    <figure className={cn("relative", className)}>
      {caption ? (
        <figcaption className="text-muted-foreground mb-1.5 font-mono text-xs">
          {caption}
        </figcaption>
      ) : null}

      <div className="bg-muted border-border relative rounded-lg border">
        {/* `overflow-x-auto` on the <pre> itself: a long import line has to
            scroll inside the block rather than widening the page. */}
        <pre className="overflow-x-auto p-4 pr-12 text-sm leading-relaxed">
          <code>{code}</code>
        </pre>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          // The button is icon-only, so this label is its whole accessible name.
          aria-label={
            isCopied
              ? t("documents.code.copied")
              : t("documents.code.copyLabel")
          }
          className="absolute top-2 right-2"
          onClick={() => {
            void copy(code);
          }}
        >
          {isCopied ? (
            <Check className="text-primary size-4" />
          ) : (
            <Copy className="size-4" />
          )}
        </Button>
      </div>
    </figure>
  );
}
