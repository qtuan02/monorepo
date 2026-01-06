import { Link } from "react-router";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@monorepo/ui/components/tabs";

import type { ComponentPreview } from "./previews-section";
import type { ComponentMetadata } from "~/types/component-metadata";
import CodeViewer from "./code-viewer";
import ImportSection from "./import-section";
import PackageBadge from "./package-badge";
import PreviewContainer from "./preview-container";
import PreviewsSection from "./previews-section";
import PropsTable from "./props-table";

interface ComponentDetailProps {
  component: ComponentMetadata;
}

export default function ComponentDetail({ component }: ComponentDetailProps) {
  // Transform previews array to match PreviewsSection interface
  const transformedPreviews: ComponentPreview[] =
    component.previews?.map((code, index) => ({
      title: `Preview ${index + 1}`,
      description: `Usage preview for ${component.name}`,
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
      <Tabs defaultValue="preview" className="mt-6">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="preview">
            Preview{" "}
            {transformedPreviews.length > 0 && (
              <span className="ml-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-100">
                {transformedPreviews.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
          {component.props && component.props.length > 0 && (
            <TabsTrigger value="props">Props</TabsTrigger>
          )}
        </TabsList>

        {/* Preview Tab - Live UI Demo */}
        <TabsContent value="preview" className="mt-6 space-y-8">
          {/* Live Component Preview */}
          <section>
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
              Live Preview
            </h2>
            <PreviewContainer component={component} />
          </section>

          {/* Previews with code */}
          {transformedPreviews.length > 0 && (
            <PreviewsSection
              previews={transformedPreviews}
              componentName={component.name}
            />
          )}
        </TabsContent>

        {/* Source Code Tab */}
        <TabsContent value="code" className="mt-6 space-y-8">
          {/* Import Section */}
          <ImportSection
            packageName="@monorepo/ui"
            componentName={component.name}
            componentId={component.id}
          />

          <section>
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
              Source Code
            </h2>
            <CodeViewer
              code={component.sourceCode}
              language="tsx"
              filename={component.filePath}
            />
          </section>
        </TabsContent>

        {/* Props Tab - Only if props exist */}
        {component.props && component.props.length > 0 && (
          <TabsContent value="props" className="mt-6">
            <PropsTable props={component.props} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
