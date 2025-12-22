import { Link } from "react-router";

import type { ComponentMetadata } from "~/types/component-metadata";
import CodeViewer from "./code-viewer";
import PackageBadge from "./package-badge";
import PreviewContainer from "./preview-container";
import PropsTable from "./props-table";

interface ComponentDetailProps {
  component: ComponentMetadata;
  categorySlug: string;
}

export default function ComponentDetail({
  component,
  categorySlug,
}: ComponentDetailProps) {
  return (
    <div className="space-y-8" data-testid="component-detail">
      {/* Header Section */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {component.name}
            </h1>
            {component.description && (
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                {component.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <PackageBadge package={component.package} />
            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
              {component.category}
            </span>
          </div>
        </div>

        {/* Back link */}
        <Link
          to={`/components/${categorySlug}`}
          className="inline-flex items-center text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          ← Back to {component.category}
        </Link>
      </header>

      {/* Preview Section */}
      <section aria-labelledby="preview-heading">
        <h2
          id="preview-heading"
          className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100"
        >
          Preview
        </h2>
        <PreviewContainer component={component} />
      </section>

      {/* Props Table Section */}
      <section aria-labelledby="props-heading">
        <h2
          id="props-heading"
          className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100"
        >
          Props
        </h2>
        <PropsTable props={component.props} />
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
          code={component.sourceCode}
          language="tsx"
          filename={component.filePath}
        />
      </section>

      {/* Examples Section */}
      {component.examples && component.examples.length > 0 && (
        <section aria-labelledby="examples-heading">
          <h2
            id="examples-heading"
            className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100"
          >
            Examples
          </h2>
          <div className="space-y-4">
            {component.examples.map((example, index) => (
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
