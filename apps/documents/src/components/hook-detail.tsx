import { Link } from "react-router";

import type { HookMetadata } from "~/types/hook-metadata";
import { hookPreviews } from "~/constants/hook-previews";
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
            <h1 className="text-3xl font-bold text-black dark:text-white">
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
          className="inline-flex items-center text-sm text-gray-500 hover:text-black hover:underline dark:text-gray-400 dark:hover:text-white"
        >
          ← Back to Hooks
        </Link>
      </header>

      {/* Usage Section - Shows live preview and preview code */}
      {hookPreviews[hook.id] && (
        <section aria-labelledby="usage-heading">
          <h2
            id="usage-heading"
            className="mb-4 text-xl font-semibold text-black dark:text-white"
          >
            Usage Preview
          </h2>
          <div className="space-y-4">
            {/* Live Preview */}
            <div>
              <h3 className="mb-2 text-sm font-medium text-black dark:text-white">
                Live Preview
              </h3>
              <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-black">
                {(() => {
                  const PreviewComponent = hookPreviews[hook.id]?.component;
                  return PreviewComponent ? <PreviewComponent /> : null;
                })()}
              </div>
            </div>
            {/* Preview Code */}
            <div>
              <h3 className="mb-2 text-sm font-medium text-black dark:text-white">
                Preview Code
              </h3>
              <CodeViewer
                code={hookPreviews[hook.id]?.code ?? ""}
                language="tsx"
                filename="Preview Usage"
              />
            </div>
          </div>
        </section>
      )}

      {/* Parameters Section */}
      <section aria-labelledby="parameters-heading">
        <h2
          id="parameters-heading"
          className="mb-4 text-xl font-semibold text-black dark:text-white"
        >
          Parameters
        </h2>
        <ParametersTable parameters={hook.parameters} />
      </section>

      {/* Source Code Section */}
      <section aria-labelledby="source-heading">
        <h2
          id="source-heading"
          className="mb-4 text-xl font-semibold text-black dark:text-white"
        >
          Source Code
        </h2>
        <CodeViewer
          code={hook.sourceCode}
          language="tsx"
          filename={hook.filePath}
        />
      </section>
    </div>
  );
}
