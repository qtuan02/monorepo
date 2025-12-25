import type { ComponentMetadata } from "~/types/component-metadata";
import CodeViewer from "./code-viewer";
import PreviewContainer from "./preview-container";

interface UsageSectionProps {
  code: string;
  component?: ComponentMetadata;
  showPreview?: boolean;
}

export default function UsageSection({
  code,
  component,
  showPreview = false,
}: UsageSectionProps) {
  return (
    <section aria-labelledby="usage-heading" className="space-y-4">
      <h2
        id="usage-heading"
        className="text-xl font-semibold text-gray-900 dark:text-gray-100"
      >
        Usage
      </h2>

      {/* UI Preview */}
      {showPreview && component && (
        <div className="mb-4">
          <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Preview
          </h3>
          <PreviewContainer component={component} />
        </div>
      )}

      {/* Code */}
      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Code
        </h3>
        <CodeViewer code={code} language="tsx" />
      </div>
    </section>
  );
}
