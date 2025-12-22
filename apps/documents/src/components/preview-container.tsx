import type { ReactNode } from "react";
import { Component, Suspense, useEffect, useState } from "react";

import type { ComponentMetadata } from "~/types/component-metadata";
import { componentRegistry } from "~/generated/registry";

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

// Loading fallback component
function PreviewLoading() {
  return (
    <div
      className="flex h-48 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
      data-testid="preview-loading"
    >
      <div className="text-center">
        <div className="mb-2 h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900 dark:border-gray-600 dark:border-t-gray-100" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Loading preview...
        </p>
      </div>
    </div>
  );
}

// Error fallback component
function PreviewError({ componentName }: { componentName: string }) {
  return (
    <div
      className="flex h-48 items-center justify-center rounded-lg border border-red-200 bg-red-50 dark:border-red-800/50 dark:bg-red-900/20"
      data-testid="preview-error"
    >
      <div className="text-center">
        <div className="mb-2 text-2xl">⚠️</div>
        <p className="font-medium text-red-700 dark:text-red-400">
          Failed to render preview
        </p>
        <p className="text-sm text-red-600 dark:text-red-500">
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
      className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800"
      data-testid="preview-placeholder"
    >
      <div className="text-center">
        <div className="mb-2 text-4xl text-gray-400 dark:text-gray-500">🎨</div>
        <p className="font-medium text-gray-600 dark:text-gray-400">
          {componentName}
        </p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
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

  const LazyComponent = componentRegistry[component.id];

  const renderPreview = () => {
    if (!LazyComponent) {
      return <PreviewPlaceholder componentName={component.name} />;
    }

    // Pass default children if it's a known container/content component
    // This is a naive heuristic; ideally we'd have specific examples
    const props: Record<string, any> = {};

    // Add default children for common components to avoid empty rendering
    if (["button", "badge", "label"].includes(component.id)) {
      props.children = component.name;
    }

    return <LazyComponent {...props} />;
  };

  return (
    <div
      className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
      data-testid="preview-container"
    >
      {/* Preview Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-800">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Preview
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-500">
          Interactive
        </span>
      </div>

      {/* Preview Content */}
      <div className="flex min-h-[200px] items-center justify-center p-6">
        <ErrorBoundary
          fallback={<PreviewError componentName={component.name} />}
        >
          <Suspense fallback={<PreviewLoading />}>{renderPreview()}</Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}
