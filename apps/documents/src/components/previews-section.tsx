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
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800/50">
        <div className="mb-3 flex justify-center">
          <span className="rounded-full bg-yellow-100 px-3 py-1.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            Previews Coming Soon
          </span>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          No previews available for {componentName} yet.
        </p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
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
          className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900"
        >
          {/* Preview Header */}
          <div className="mb-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
              <Play className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              {preview.title}
            </h3>
            {preview.description && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {preview.description}
              </p>
            )}
          </div>

          {/* Code Preview */}
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
