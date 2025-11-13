"use client";

import type { FC } from "react";
import useCopyToClipboard from "@monorepo/ui/hooks/use-copy-to-clipboard";
import useMediaQuery from "@monorepo/ui/hooks/use-media-query";
import { Check, Copy } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeBlockProps {
  code: string;
  language?: string;
}

const CodeBlock: FC<CodeBlockProps> = ({ code, language = "tsx" }) => {
  const { copied, copy } = useCopyToClipboard();
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <div className="relative overflow-hidden rounded-md">
      <button
        className="absolute top-2 right-2 cursor-pointer rounded-md bg-gray-500/50 p-2 text-gray-800 transition-all duration-300 hover:translate-y-[-1px] dark:bg-gray-800/80 dark:text-gray-200"
        onClick={() => copy(code)}
      >
        {copied ? (
          <Check className="size-3 text-white md:size-4" />
        ) : (
          <Copy className="size-3 text-white md:size-4" />
        )}
      </button>
      <SyntaxHighlighter
        language={language}
        showLineNumbers
        wrapLongLines
        style={oneDark as Record<string, React.CSSProperties>}
        customStyle={{
          fontSize: isMobile ? "12px" : "14px",
          padding: "16px",
          margin: "0",
        }}
      >
        {code.trim()}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;
