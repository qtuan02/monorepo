import { useCallback, useState } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@monorepo/ui/components/tooltip";

interface CodeViewerProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
}

export default function CodeViewer({
  code,
  language = "tsx",
  filename,
  showLineNumbers = true,
}: CodeViewerProps) {
  const [copied, setCopied] = useState(false);
  const [lineNumbersVisible, setLineNumbersVisible] = useState(showLineNumbers);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  }, [code]);

  const toggleLineNumbers = useCallback(() => {
    setLineNumbersVisible((prev) => !prev);
  }, []);

  const lines = code.split("\n");

  if (!code) {
    return (
      <div
        className="border-border bg-muted/50 rounded-lg border p-8 text-center"
        data-testid="code-viewer-empty"
      >
        <p className="text-muted-foreground">No source code available.</p>
      </div>
    );
  }

  return (
    <div
      className="border-border overflow-hidden rounded-lg border"
      data-testid="code-viewer"
    >
      <div className="border-border bg-muted/50 flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-3">
          {filename && (
            <span className="text-muted-foreground font-mono text-sm">
              {filename}
            </span>
          )}
          <span className="border-border bg-background text-foreground rounded border px-2 py-0.5 text-xs font-medium uppercase">
            {language}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={toggleLineNumbers}
                className="text-muted-foreground hover:bg-accent hover:text-foreground rounded px-2 py-1 text-xs"
                aria-label={
                  lineNumbersVisible ? "Hide line numbers" : "Show line numbers"
                }
              >
                {lineNumbersVisible ? "Hide #" : "Show #"}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {lineNumbersVisible ? "Hide line numbers" : "Show line numbers"}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleCopy}
                className="border-border bg-background text-foreground hover:bg-muted flex items-center gap-1.5 rounded border px-3 py-1.5 text-sm font-medium transition-colors"
                data-testid="copy-button"
                aria-label={copied ? "Code copied" : "Copy code to clipboard"}
              >
                {copied ? (
                  <>
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {copied ? "Copied to clipboard!" : "Copy code"}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="max-h-[500px] overflow-auto bg-black">
        <pre className="p-4 text-sm leading-relaxed">
          <code className="block">
            {lines.map((line, index) => (
              <div key={index} className="flex">
                {lineNumbersVisible && (
                  <span
                    className="text-muted-foreground mr-4 inline-block w-8 text-right select-none"
                    data-testid="line-number"
                  >
                    {index + 1}
                  </span>
                )}
                <span className="flex-1 text-gray-200">{line || " "}</span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}
