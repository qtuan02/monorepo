"use client";

import { FC } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import useCopyToClipboard from "@web/web-ui/hooks/use-copy-to-clipboard";
import { Check, Copy } from "lucide-react";
import useMediaQuery from "@web/web-ui/hooks/use-media-query";
interface CodeBlockProps {
  code: string;
  language?: string;
}

const CodeBlock: FC<CodeBlockProps> = ({ code, language = "tsx" }) => {
  const { copied, copy } = useCopyToClipboard();
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <div className="rounded-md overflow-hidden relative">
      <button
        className="absolute top-2 right-2 cursor-pointer bg-gray-500/50 dark:bg-gray-800/80 text-gray-800 dark:text-gray-200 p-2 rounded-md"
        onClick={() => copy(code)}
      >
        {copied ? (
          <Check className="size-3 md:size-4 text-white" />
        ) : (
          <Copy className="size-3 md:size-4 text-white" />
        )}
      </button>
      <SyntaxHighlighter
        language={language}
        showLineNumbers
        wrapLongLines
        style={oneDark}
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
