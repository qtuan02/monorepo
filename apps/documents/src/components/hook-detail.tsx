import { Link } from "react-router";

import type { HookMetadata } from "~/types/hook-metadata";
import { hookExamples } from "~/registry/hook-examples";
import CodeViewer from "./code-viewer";
import PackageBadge from "./package-badge";
import ParametersTable from "./parameters-table";

interface HookDetailProps {
  hook: HookMetadata;
}

export default function HookDetail({ hook }: HookDetailProps) {
  return (
    <div className="space-y-8" data-testid="hook-detail">
      {/* Header Section */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {hook.name}
            </h1>
            {hook.description && (
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                {hook.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <PackageBadge package={hook.package} />
          </div>
        </div>

        {/* Back link */}
        <Link
          to="/hooks"
          className="inline-flex items-center text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          ← Back to Hooks
        </Link>
      </header>

      {/* Usage Section - Shows live demo and example code */}
      {hookExamples[hook.id] && (
        <section aria-labelledby="usage-heading">
          <h2
            id="usage-heading"
            className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100"
          >
            Usage Example
          </h2>
          <div className="space-y-4">
            {/* Live Demo */}
            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Live Demo
              </h3>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                {(() => {
                  const DemoComponent = hookExamples[hook.id]?.component;
                  return DemoComponent ? <DemoComponent /> : null;
                })()}
              </div>
            </div>
            {/* Example Code */}
            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Example Code
              </h3>
              <CodeViewer
                code={hookExamples[hook.id]?.code ?? ""}
                language="tsx"
                filename="Example Usage"
              />
            </div>
          </div>
        </section>
      )}

      {/* Parameters Section */}
      <section aria-labelledby="parameters-heading">
        <h2
          id="parameters-heading"
          className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100"
        >
          Parameters
        </h2>
        <ParametersTable parameters={hook.parameters} />
      </section>

      {/* Source Code Section */}
      <section aria-labelledby="source-heading">
        <h2
          id="source-heading"
          className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100"
        >
          Source Code
        </h2>
        <CodeViewer
          code={hook.sourceCode}
          language="tsx"
          filename={hook.filePath}
        />
      </section>

      {/* Examples Section */}
      {hook.examples && hook.examples.length > 0 && (
        <section aria-labelledby="examples-heading">
          <h2
            id="examples-heading"
            className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100"
          >
            Examples
          </h2>
          <div className="space-y-4">
            {hook.examples.map((example, index) => (
              <CodeViewer
                key={index}
                code={example}
                language="tsx"
                filename={`Example ${index + 1}`}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
