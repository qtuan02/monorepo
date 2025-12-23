import { Play } from "lucide-react";

import CodeViewer from "./code-viewer";

export interface ComponentExample {
  title: string;
  description: string;
  code: string;
}

interface ExamplesSectionProps {
  examples: ComponentExample[];
  componentName: string;
}

export default function ExamplesSection({
  examples,
  componentName,
}: ExamplesSectionProps) {
  if (!examples || examples.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800/50">
        <div className="mb-3 flex justify-center">
          <span className="rounded-full bg-yellow-100 px-3 py-1.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            Examples Coming Soon
          </span>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          No examples available for {componentName} yet.
        </p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
          Check back soon or contribute examples to the documentation.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {examples.map((example, index) => (
        <div
          key={index}
          className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900"
        >
          {/* Example Header */}
          <div className="mb-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
              <Play className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              {example.title}
            </h3>
            {example.description && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {example.description}
              </p>
            )}
          </div>

          {/* Code Example */}
          <CodeViewer
            code={example.code}
            language="tsx"
            filename={`${example.title.toLowerCase().replace(/\s+/g, "-")}.tsx`}
          />
        </div>
      ))}
    </div>
  );
}
