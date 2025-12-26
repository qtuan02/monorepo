import { useEffect } from "react";
import { Link, useParams } from "react-router";

import AppLayout from "~/components/app-layout";
import Breadcrumb from "~/components/breadcrumb";
import ComponentDetail from "~/components/component-detail";
import { useComponentById } from "~/lib/use-component-metadata";

export default function ComponentDetailPage() {
  const { id } = useParams<{
    id: string;
  }>();
  const { component, isLoading } = useComponentById(id || "");

  useEffect(() => {
    if (component) {
      document.title = `Component | ${component.name}`;
    }
  }, [component]);

  // Loading state
  if (isLoading) {
    return (
      <AppLayout currentPath={`/components/${id}`}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900 dark:border-gray-600 dark:border-t-gray-100" />
            <p className="text-gray-600 dark:text-gray-400">
              Loading component...
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Component not found
  if (!component) {
    return (
      <AppLayout currentPath={`/components/${id}`}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
              Component Not Found
            </h1>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              The component &quot;{id}&quot; could not be found.
            </p>
            <Link
              to="/components"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              ← Back to Components
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout currentPath={`/components/${id}`}>
      <div className="px-6 py-6 md:px-12">
        <div className="mx-auto max-w-7xl">
          <Breadcrumb
            items={[
              { label: "Home", path: "/" },
              { label: "Components", path: "/components" },
              { label: component.name },
            ]}
            className="mb-6"
          />
          <ComponentDetail component={component} />
        </div>
      </div>
    </AppLayout>
  );
}
