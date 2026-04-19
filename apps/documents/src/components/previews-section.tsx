import { Play } from "lucide-react";

import CodeViewer from "./code-viewer";

export interface ComponentPreview {
  title: string;
  description: string;
  code: string;
}

interface PreviewsSectionProps {
  previews: ComponentPreview[];
  componentName: string;
}

export default function PreviewsSection({
  previews,
  componentName,
}: PreviewsSectionProps) {
  if (!previews || previews.length === 0) {
    return (
      <div className="border-border bg-muted/50 rounded-lg border p-8 text-center">
        <div className="mb-3 flex justify-center">
          <span className="rounded-full bg-yellow-100 px-3 py-1.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            Previews Coming Soon
          </span>
        </div>
        <p className="text-muted-foreground">
          No previews available for {componentName} yet.
        </p>
        <p className="text-muted-foreground mt-2 text-sm">
          Check back soon or contribute previews to the documentation.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {previews.map((preview, index) => (
        <div
          key={index}
          className="border-border bg-card rounded-lg border p-6"
        >
          <div className="mb-4">
            <h3 className="text-foreground flex items-center gap-2 text-lg font-semibold">
              <Play className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              {preview.title}
            </h3>
            {preview.description && (
              <p className="text-muted-foreground mt-2 text-sm">
                {preview.description}
              </p>
            )}
          </div>

          <CodeViewer
            code={preview.code}
            language="tsx"
            filename={`${preview.title.toLowerCase().replace(/\s+/g, "-")}.tsx`}
          />
        </div>
      ))}
    </div>
  );
}
