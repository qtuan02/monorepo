import { useEffect } from "react";
import { Link, useParams } from "react-router";

import Breadcrumb from "~/components/breadcrumb";
import ComponentDetail from "~/components/component-detail";
import { useComponentById } from "~/hooks/use-component-metadata";

export default function ComponentDetailPage() {
  const { id } = useParams<{
    id: string;
  }>();
  const { component } = useComponentById(id || "");

  useEffect(() => {
    if (component) {
      document.title = `Component | ${component.name}`;
    }
  }, [component]);

  if (!component) {
    return (
      <>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <h1 className="text-foreground mb-2 text-2xl font-bold">
              Component Not Found
            </h1>
            <p className="text-muted-foreground mb-4">
              The component &quot;{id}&quot; could not be found.
            </p>
            <Link to="/components" className="text-primary hover:underline">
              ← Back to Components
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="px-4 py-4 md:px-12 md:py-6">
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
    </>
  );
}
