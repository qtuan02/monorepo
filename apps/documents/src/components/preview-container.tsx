import type { ReactNode } from "react";
import { Component, Suspense, useEffect, useState } from "react";

import type { ComponentMetadata } from "~/types/component-metadata";
import { componentPreviews } from "~/constants/component-previews";
import { componentRegistry } from "~/constants/registry";

// Error Boundary Component
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

// Loading fallback component with skeleton animation
function PreviewLoading() {
  return (
    <div
      className="flex h-48 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900"
      data-testid="preview-loading"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="size-8 animate-spin rounded-full border-2 border-gray-200 border-t-black dark:border-gray-800 dark:border-t-white" />
        </div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Loading component...
        </p>
      </div>
    </div>
  );
}

// Error fallback component
function PreviewError({ componentName }: { componentName: string }) {
  return (
    <div
      className="flex h-48 items-center justify-center rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-black"
      data-testid="preview-error"
    >
      <div className="text-center">
        <div className="mb-2 flex justify-center">
          <div className="flex size-10 items-center justify-center rounded-full border border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
            <span className="text-lg">!</span>
          </div>
        </div>
        <p className="font-medium text-black dark:text-white">
          Failed to render preview
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Component &quot;{componentName}&quot; could not be rendered
        </p>
      </div>
    </div>
  );
}

// Placeholder preview when component is not available
function PreviewPlaceholder({ componentName }: { componentName: string }) {
  return (
    <div
      className="flex h-48 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50"
      data-testid="preview-placeholder"
    >
      <div className="text-center">
        <div className="mb-2 text-2xl text-gray-400 dark:text-gray-600">❖</div>
        <p className="font-medium text-gray-900 dark:text-white">
          {componentName}
        </p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Preview not available
        </p>
      </div>
    </div>
  );
}

export default function PreviewContainer({ component }: PreviewContainerProps) {
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side before attempting to render
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <PreviewLoading />;
  }

  // Check if we have a dedicated demo component
  const previewItem = componentPreviews[component.id];
  const LazyComponent = componentRegistry[component.id];

  const renderPreview = () => {
    // Prefer demo component if available
    if (previewItem) {
      const PreviewComponent = previewItem.component;
      return <PreviewComponent />;
    }

    if (!LazyComponent) {
      return <PreviewPlaceholder componentName={component.name} />;
    }

    // Fallback: render basic component with default props
    const props: Record<string, any> = {};

    // Add default children for common components to avoid empty rendering
    if (["button", "badge", "label"].includes(component.id)) {
      props.children = component.name;
    }

    return <LazyComponent {...props} />;
  };

  return (
    <div
      className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-black"
      data-testid="preview-container"
    >
      {/* Preview Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50/50 px-4 py-2 dark:border-gray-800 dark:bg-gray-900/50">
        <span className="text-sm font-medium text-black dark:text-white">
          Preview
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Interactive
        </span>
      </div>

      {/* Preview Content */}
      <div className="flex min-h-[200px] items-center justify-center bg-white p-6 dark:bg-black">
        <ErrorBoundary
          fallback={<PreviewError componentName={component.name} />}
        >
          <Suspense fallback={<PreviewLoading />}>{renderPreview()}</Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}
