import AppLayout from "~/components/app-layout";
import Breadcrumb from "~/components/breadcrumb";
import ComponentCard from "~/components/component-card";
import { useComponentMetadata } from "~/lib/use-component-metadata";

export default function AllComponentsPage() {
  const { components, isLoading } = useComponentMetadata();

  // Sort all components alphabetically
  const sortedComponents = [...components].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  return (
    <AppLayout currentPath="/components">
      <div className="px-6 py-6 md:px-12">
        <div className="mx-auto max-w-7xl">
          <Breadcrumb
            items={[{ label: "Home", path: "/" }, { label: "Components" }]}
            className="mb-4"
          />
          <div className="mb-6">
            <h1 className="text-3xl font-bold">All Components</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Browse all available UI components from the shadcn collection
            </p>
          </div>

          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <div className="space-y-8">
              {/* Single shadcn section with all components */}
              <section>
                <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  shadcn
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {sortedComponents.map((component) => (
                    <ComponentCard key={component.id} component={component} />
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
