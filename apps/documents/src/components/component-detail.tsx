import { Link } from "react-router";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@monorepo/ui/components/tabs";

import type { ComponentMetadata } from "~/types/component-metadata";
import CodeViewer from "./code-viewer";
import ExamplesSection from "./examples-section";
import ImportSection from "./import-section";
import PackageBadge from "./package-badge";
import PropsTable from "./props-table";
import UsageSection from "./usage-section";

interface ComponentDetailProps {
  component: ComponentMetadata;
  categorySlug: string;
}

export default function ComponentDetail({
  component,
  categorySlug,
}: ComponentDetailProps) {
  // Transform examples array to match ExamplesSection interface
  const componentExamples =
    component.examples?.map((code, index) => ({
      title: `Example ${index + 1}`,
      description: `Usage example for ${component.name}`,
      code,
    })) || [];

  return (
    <div className="space-y-6" data-testid="component-detail">
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

      {/* Tabs Layout */}
      <Tabs defaultValue="overview" className="mt-6">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="examples">
            Examples{" "}
            {componentExamples.length > 0 && (
              <span className="ml-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-100">
                {componentExamples.length}
              </span>
            )}
          </TabsTrigger>
          {component.props && component.props.length > 0 && (
            <TabsTrigger value="props">Props</TabsTrigger>
          )}
          <TabsTrigger value="code">Source Code</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6 space-y-8">
          {/* Import Section */}
          <ImportSection
            packageName="@monorepo/ui"
            componentName={component.name}
            componentId={component.id}
          />

          {/* Usage Section with Preview */}
          <UsageSection
            code={`<${component.name} />`}
            component={component}
            showPreview={true}
          />
        </TabsContent>

        {/* Examples Tab */}
        <TabsContent value="examples" className="mt-6">
          <ExamplesSection
            examples={componentExamples}
            componentName={component.name}
          />
        </TabsContent>

        {/* Props Tab - Only if props exist */}
        {component.props && component.props.length > 0 && (
          <TabsContent value="props" className="mt-6">
            <PropsTable props={component.props} />
          </TabsContent>
        )}

        {/* Source Code Tab */}
        <TabsContent value="code" className="mt-6">
          <CodeViewer
            code={component.sourceCode}
            language="tsx"
            filename={component.filePath}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
