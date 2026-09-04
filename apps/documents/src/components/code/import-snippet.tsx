import { buildImportStatement } from "~/utils/build-import-statement";
import { CodeBlock } from "./code-block";

interface ImportSnippetProps {
  exports: readonly string[];
  /** The published specifier, e.g. `@fe-monorepo/ui/components/button`. */
  importPath: string;
}

/** The copy-me line at the top of every primitive and hook page. */
export function ImportSnippet({ exports, importPath }: ImportSnippetProps) {
  return <CodeBlock code={buildImportStatement(exports, importPath)} />;
}
