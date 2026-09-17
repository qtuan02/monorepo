import { Check, Copy } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useCopyToClipboard } from "@monorepo/hook/use-copy-to-clipboard";
import { Button } from "@monorepo/ui/components/button";
import { cn } from "@monorepo/ui/utils/cn";

import type { CodeToken, CodeTokenKind } from "~/types/code-token";
import { codeTokensToText } from "~/utils/code-tokens-to-text";

interface CodeBlockProps {
  /** Plain text, or the same text cut into runs a colour is named for. */
  code: string | readonly CodeToken[];
  /** Shown above the block when a snippet needs naming (a file path, a shell). */
  caption?: string;
  className?: string;
}

const tokenClassName: Record<CodeTokenKind, string> = {
  keyword: "text-(--code-keyword)",
  string: "text-(--code-string)",
  comment: "text-(--code-comment)",
};

/**
 * A read-only snippet with a copy button — the one way this site renders code:
 * the deep indigo block of the direction (brief §2c), light ink on it.
 *
 * No highlighter and no line numbers: every snippet here is four lines of an
 * import or a shell command, so a tokenizer would be a bundle cost paid for
 * nothing. Where a snippet is worth colouring, the call site hands the runs in
 * as a `CodeToken[]` and this renders each as a span. The copy button uses
 * `useCopyToClipboard` from the very package the site documents, which is the
 * cheapest possible proof it works.
 */
export function CodeBlock({ code, caption, className }: CodeBlockProps) {
  const { t } = useTranslation();
  const [copiedText, copy] = useCopyToClipboard();
  const text = codeTokensToText(code);
  const isCopied = copiedText === text;

  return (
    <figure className={cn("relative", className)}>
      {caption ? (
        <figcaption className="text-muted-foreground mb-1.5 font-mono text-xs">
          {caption}
        </figcaption>
      ) : null}

      <div className="bg-(--code-block) text-(--code-block-foreground) shadow-(--sh-3) relative rounded-[14px]">
        {/* `overflow-x-auto` on the <pre> itself: a long import line has to
            scroll inside the block rather than widening the page. */}
        <pre className="overflow-x-auto p-4 pr-14 font-mono text-[13.5px] leading-[1.7]">
          <code>
            {typeof code === "string"
              ? code
              : code.map((token, index) =>
                  typeof token === "string" ? (
                    token
                  ) : (
                    // A snippet is a fixed list that never reorders, so the
                    // prefixed index is the stable key here.
                    <span
                      // biome-ignore lint/suspicious/noArrayIndexKey: static token list
                      key={`code-token-${index}`}
                      data-token={token.kind}
                      className={tokenClassName[token.kind]}
                    >
                      {token.text}
                    </span>
                  ),
                )}
          </code>
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
          className="bg-(--code-block-foreground)/12 text-(--code-block-foreground) hover:bg-(--code-block-foreground)/25 hover:text-(--code-block-foreground) absolute top-2.5 right-2.5 rounded-full"
          onClick={() => {
            void copy(text);
          }}
        >
          {isCopied ? (
            <Check className="text-(--code-string) size-4" />
          ) : (
            <Copy className="size-4" />
          )}
        </Button>
        {/* A changed `aria-label` is not announced; a status region is. */}
        <span role="status" className="sr-only">
          {isCopied ? t("documents.code.copied") : null}
        </span>
      </div>
    </figure>
  );
}
