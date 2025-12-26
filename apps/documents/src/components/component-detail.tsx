import { Link } from "react-router";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@monorepo/ui/components/tabs";

import type { ComponentMetadata } from "~/types/component-metadata";
import { componentExamples as componentDemoRegistry } from "~/registry/component-examples";
import CodeViewer from "./code-viewer";
import ExamplesSection from "./examples-section";
import ImportSection from "./import-section";
import PackageBadge from "./package-badge";
import PreviewContainer from "./preview-container";
import PropsTable from "./props-table";
import UsageSection from "./usage-section";

interface ComponentDetailProps {
  component: ComponentMetadata;
}

export default function ComponentDetail({ component }: ComponentDetailProps) {
  // Transform examples array to match ExamplesSection interface
  const transformedExamples =
    component.examples?.map((code, index) => ({
      title: `Example ${index + 1}`,
      description: `Usage example for ${component.name}`,
      code,
    })) || [];

  // Get demo code for usage section (matches preview tab)
  const demoExample = componentDemoRegistry[component.id];
  const usageCode = demoExample?.code || `<${component.name} />`;

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
          </div>
        </div>

        {/* Back link */}
        <Link
          to="/components"
          className="inline-flex items-center text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          ← Back to Components
        </Link>
      </header>

      {/* Tabs Layout */}
      <Tabs defaultValue="overview" className="mt-6">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="preview">
            Preview{" "}
            {transformedExamples.length > 0 && (
              <span className="ml-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-100">
                {transformedExamples.length}
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

          {/* Usage Section - Shows demo code matching preview */}
          <UsageSection
            code={usageCode}
            component={component}
            showPreview={false}
          />
        </TabsContent>

        {/* Preview Tab - Live UI Demo */}
        <TabsContent value="preview" className="mt-6 space-y-8">
          {/* Live Component Preview */}
          <section>
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
              Live Preview
            </h2>
            <PreviewContainer component={component} />
          </section>

          {/* Examples with code */}
          {transformedExamples.length > 0 && (
            <ExamplesSection
              examples={transformedExamples}
              componentName={component.name}
            />
          )}
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
