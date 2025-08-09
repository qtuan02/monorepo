import { FC } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeBlockProps {
  code: string;
  language?: string;
}

const CodeBlock: FC<CodeBlockProps> = ({ code, language = "tsx" }) => {
  return (
    <div className="rounded-md overflow-hidden max-w-3xl">
      <SyntaxHighlighter
        language={language}
        showLineNumbers
        wrapLongLines
        style={oneDark}
        customStyle={{
          fontSize: "14px",
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
