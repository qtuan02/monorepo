import type { ReactNode } from "react";
import { Component, Suspense, useEffect, useState } from "react";

import type { ComponentMetadata } from "~/types/component-metadata";
import { componentPreviews } from "~/constants/component-previews";
import { componentRegistry } from "~/constants/registry";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

interface PreviewContainerProps {
  component: ComponentMetadata;
}

function PreviewLoading() {
  return (
    <div
      className="border-border bg-muted/50 flex h-48 items-center justify-center rounded-lg border"
      data-testid="preview-loading"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="border-border border-t-foreground size-8 animate-spin rounded-full border-2" />
        </div>
        <p className="text-muted-foreground text-sm font-medium">
          Loading component...
        </p>
      </div>
    </div>
  );
}

function PreviewError({ componentName }: { componentName: string }) {
  return (
    <div
      className="border-border bg-card flex h-48 items-center justify-center rounded-lg border"
      data-testid="preview-error"
    >
      <div className="text-center">
        <div className="mb-2 flex justify-center">
          <div className="border-border bg-muted flex size-10 items-center justify-center rounded-full border">
            <span className="text-lg">!</span>
          </div>
        </div>
        <p className="text-foreground font-medium">Failed to render preview</p>
        <p className="text-muted-foreground text-sm">
          Component &quot;{componentName}&quot; could not be rendered
        </p>
      </div>
    </div>
  );
}

function PreviewPlaceholder({ componentName }: { componentName: string }) {
  return (
    <div
      className="border-border bg-muted/30 flex h-48 items-center justify-center rounded-lg border border-dashed"
      data-testid="preview-placeholder"
    >
      <div className="text-center">
        <div className="text-muted-foreground mb-2 text-2xl">❖</div>
        <p className="text-foreground font-medium">{componentName}</p>
        <p className="text-muted-foreground mt-1 text-sm">
          Preview not available
        </p>
      </div>
    </div>
  );
}

export default function PreviewContainer({ component }: PreviewContainerProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <PreviewLoading />;
  }

  const previewItem = componentPreviews[component.id];
  const LazyComponent = componentRegistry[component.id];

  const renderPreview = () => {
    if (previewItem) {
      const PreviewComponent = previewItem.component;
      return <PreviewComponent />;
    }

    if (!LazyComponent) {
      return <PreviewPlaceholder componentName={component.name} />;
    }

    const props: Record<string, unknown> = {};

    if (["button", "badge", "label"].includes(component.id)) {
      props.children = component.name;
    }

    return <LazyComponent {...props} />;
  };

  return (
    <div
      className="border-border bg-card overflow-hidden rounded-lg border"
      data-testid="preview-container"
    >
      <div className="border-border bg-muted/30 flex items-center justify-between border-b px-4 py-2">
        <span className="text-foreground text-sm font-medium">Preview</span>
        <span className="text-muted-foreground text-xs">Interactive</span>
      </div>

      <div className="bg-background flex min-h-[200px] items-center justify-center p-6">
        <ErrorBoundary
          fallback={<PreviewError componentName={component.name} />}
        >
          <Suspense fallback={<PreviewLoading />}>{renderPreview()}</Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}
