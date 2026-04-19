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
      <header className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-foreground text-3xl font-bold">{hook.name}</h1>
            {hook.description && (
              <p className="text-muted-foreground mt-2 text-lg">
                {hook.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <PackageBadge package={hook.package} />
          </div>
        </div>

        <Link
          to="/hooks"
          className="text-muted-foreground hover:text-foreground inline-flex items-center text-sm hover:underline"
        >
          ← Back to Hooks
        </Link>
      </header>

      {hookPreviews[hook.id] && (
        <section aria-labelledby="usage-heading">
          <h2
            id="usage-heading"
            className="text-foreground mb-4 text-xl font-semibold"
          >
            Usage Preview
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-foreground mb-2 text-sm font-medium">
                Live Preview
              </h3>
              <div className="border-border bg-card rounded-lg border p-4">
                {(() => {
                  const PreviewComponent = hookPreviews[hook.id]?.component;
                  return PreviewComponent ? <PreviewComponent /> : null;
                })()}
              </div>
            </div>
            <div>
              <h3 className="text-foreground mb-2 text-sm font-medium">
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

      <section aria-labelledby="parameters-heading">
        <h2
          id="parameters-heading"
          className="text-foreground mb-4 text-xl font-semibold"
        >
          Parameters
        </h2>
        <ParametersTable parameters={hook.parameters} />
      </section>

      <section aria-labelledby="source-heading">
        <h2
          id="source-heading"
          className="text-foreground mb-4 text-xl font-semibold"
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
