import { Badge } from "@monorepo/ui";

import type { ComponentMetadata } from "~/types/component-metadata";
import CodeViewer from "./code-viewer";

interface ImportSectionProps {
  packageName?: string;
  componentName: string;
  componentId: string;
}

export default function ImportSection({
  packageName = "@monorepo/ui",
  componentName,
  componentId,
}: ImportSectionProps) {
  const importStatement = `import { ${componentName} } from "${packageName}/components/${componentId}";`;

  return (
    <section aria-labelledby="import-heading">
      <h2
        id="import-heading"
        className="mb-3 text-xl font-semibold text-gray-900 dark:text-gray-100"
      >
        Import
      </h2>
      <CodeViewer
        code={importStatement}
        language="tsx"
        showLineNumbers={false}
      />
    </section>
  );
}
