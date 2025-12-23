import { Terminal } from "lucide-react";

import CodeViewer from "./code-viewer";

interface InstallationSectionProps {
  packageName: string;
  componentName: string;
  componentId: string;
}

export default function InstallationSection({
  packageName,
  componentName,
  componentId,
}: InstallationSectionProps) {
  const installCommand = `npm install ${packageName}
# or
yarn add ${packageName}
# or
pnpm add ${packageName}`;

  const importStatement = `import { ${componentName} } from "${packageName}/components/${componentId}";`;

  return (
    <div className="space-y-6">
      {/* Installation */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
          <Terminal className="h-5 w-5" />
          Installation
        </h3>
        <CodeViewer code={installCommand} language="bash" filename="Terminal" />
      </div>

      {/* Import */}
      <div>
        <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
          Import
        </h3>
        <CodeViewer
          code={importStatement}
          language="typescript"
          filename="import"
        />
      </div>

      {/* Usage Note */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          <strong>Note:</strong> This component is part of the{" "}
          <code className="rounded bg-blue-100 px-1.5 py-0.5 font-mono text-xs dark:bg-blue-900">
            {packageName}
          </code>{" "}
          package. Make sure to install it before using.
        </p>
      </div>
    </div>
  );
}
