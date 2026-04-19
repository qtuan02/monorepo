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

const tabTriggerClass =
  "data-[state=active]:bg-background data-[state=active]:text-foreground";

interface ComponentDetailProps {
  component: ComponentMetadata;
}

export default function ComponentDetail({ component }: ComponentDetailProps) {
  const transformedPreviews: ComponentPreview[] =
    component.previews?.map((code, index) => ({
      title: `Preview ${index + 1}`,
      description: `Usage preview for ${component.name}`,
      code,
    })) || [];

  return (
    <div className="space-y-6" data-testid="component-detail">
      <header className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-foreground text-3xl font-bold">
              {component.name}
            </h1>
            {component.description && (
              <p className="text-muted-foreground mt-2 text-lg">
                {component.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <PackageBadge package={component.package} />
          </div>
        </div>

        <Link
          to="/components"
          className="text-muted-foreground hover:text-foreground inline-flex items-center text-sm hover:underline"
        >
          ← Back to Components
        </Link>
      </header>

      <Tabs defaultValue="preview" className="mt-6">
        <TabsList className="bg-muted w-full justify-start p-1">
          <TabsTrigger value="preview" className={tabTriggerClass}>
            Preview{" "}
            {transformedPreviews.length > 0 && (
              <span className="border-border bg-background text-foreground ml-1 rounded-full border px-2 py-0.5 text-xs font-medium">
                {transformedPreviews.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="code" className={tabTriggerClass}>
            Code
          </TabsTrigger>
          {component.props && component.props.length > 0 && (
            <TabsTrigger value="props" className={tabTriggerClass}>
              Props
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="preview" className="mt-6 space-y-8">
          <section>
            <h2 className="text-foreground mb-4 text-xl font-semibold">
              Live Preview
            </h2>
            <PreviewContainer component={component} />
          </section>

          {transformedPreviews.length > 0 && (
            <PreviewsSection
              previews={transformedPreviews}
              componentName={component.name}
            />
          )}
        </TabsContent>

        <TabsContent value="code" className="mt-6 space-y-8">
          <ImportSection
            packageName="@monorepo/ui"
            componentName={component.name}
            componentId={component.id}
          />

          <section>
            <h2 className="text-foreground mb-4 text-xl font-semibold">
              Source Code
            </h2>
            <CodeViewer
              code={component.sourceCode}
              language="tsx"
              filename={component.filePath}
            />
          </section>
        </TabsContent>

        {component.props && component.props.length > 0 && (
          <TabsContent value="props" className="mt-6">
            <PropsTable props={component.props} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
