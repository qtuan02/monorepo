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

  // Split code into lines for line number display
  const lines = code.split("\n");

  if (!code) {
    return (
      <div
        className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800"
        data-testid="code-viewer-empty"
      >
        <p className="text-gray-500 dark:text-gray-400">
          No source code available.
        </p>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
      data-testid="code-viewer"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-3">
          {filename && (
            <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
              {filename}
            </span>
          )}
          <span className="rounded bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600 uppercase dark:bg-gray-700 dark:text-gray-400">
            {language}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Line numbers toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={toggleLineNumbers}
                className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
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

          {/* Copy button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                data-testid="copy-button"
                aria-label={copied ? "Code copied" : "Copy code to clipboard"}
              >
                {copied ? (
                  <>
                    <svg
                      className="h-4 w-4 text-green-600 dark:text-green-400"
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

      {/* Code Content */}
      <div className="max-h-[500px] overflow-auto bg-gray-900 dark:bg-gray-950">
        <pre className="p-4 text-sm leading-relaxed">
          <code className="block">
            {lines.map((line, index) => (
              <div key={index} className="flex">
                {lineNumbersVisible && (
                  <span
                    className="mr-4 inline-block w-8 text-right text-gray-500 select-none"
                    data-testid="line-number"
                  >
                    {index + 1}
                  </span>
                )}
                <span className="flex-1 text-gray-100">
                  {highlightSyntax(line, language)}
                </span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}

/**
 * Basic syntax highlighting for TSX/TypeScript
 * TODO: Replace with Shiki for proper syntax highlighting in Epic 3
 */
function highlightSyntax(line: string, language: string): React.ReactNode {
  if (language !== "tsx" && language !== "typescript" && language !== "ts") {
    return line;
  }

  // Basic patterns for highlighting
  const patterns: {
    regex: RegExp;
    className: string;
  }[] = [
    // Comments
    { regex: /(\/\/.*$)/g, className: "text-gray-500" },
    // Strings
    { regex: /("[^"]*"|'[^']*'|`[^`]*`)/g, className: "text-green-400" },
    // Keywords
    {
      regex:
        /\b(import|export|from|const|let|var|function|return|if|else|for|while|class|interface|type|extends|implements|new|this|super|async|await|default|try|catch|throw|finally)\b/g,
      className: "text-purple-400",
    },
    // JSX tags
    { regex: /(<\/?[\w]+)/g, className: "text-blue-400" },
    // Numbers
    { regex: /\b(\d+)\b/g, className: "text-orange-400" },
    // Boolean/null
    { regex: /\b(true|false|null|undefined)\b/g, className: "text-orange-400" },
  ];

  // For simplicity, just return the line without full highlighting
  // Full Shiki integration will be added in Epic 3
  return line || " ";
}
