import { useParams, useSearchParams } from "react-router";

import AppLayout from "~/components/app-layout";
import Breadcrumb from "~/components/breadcrumb";
import ComponentCard from "~/components/component-card";
import EmptyState from "~/components/empty-state";
import PackageFilter from "~/components/package-filter";
import {
  filterComponentsByCategory,
  isValidCategorySlug,
  slugToCategory,
} from "~/lib/category-utils";
import {
  filterComponentsByPackage,
  getPackageFilterFromUrl,
} from "~/lib/package-filter-utils";
import { useComponentMetadata } from "~/lib/use-component-metadata";

export default function CategoryPage() {
  const { category: categorySlug } = useParams<{ category: string }>();
  const [searchParams] = useSearchParams();
  const { components, isLoading } = useComponentMetadata();

  if (!categorySlug || !isValidCategorySlug(categorySlug)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
            Invalid Category
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            The category "{categorySlug}" does not exist.
          </p>
        </div>
      </div>
    );
  }

  const category = slugToCategory(categorySlug);
  const packageFilter = getPackageFilterFromUrl(searchParams);

  // Apply both category and package filters
  let filteredComponents = filterComponentsByCategory(components, categorySlug);
  filteredComponents = filterComponentsByPackage(
    filteredComponents,
    packageFilter,
  );

  return (
    <AppLayout currentPath={`/components/${categorySlug}`}>
      <div className="px-6 py-6 md:px-12">
        <div className="mx-auto max-w-7xl">
          <Breadcrumb
            items={[
              { label: "Home", path: "/" },
              { label: "Components", path: "/components" },
              { label: category },
            ]}
            className="mb-4"
          />
          <div className="mb-6 flex items-center justify-between gap-4">
            <h1 className="text-3xl font-bold">{category}</h1>
            <PackageFilter />
          </div>
          {isLoading ? (
            <div>Loading...</div>
          ) : filteredComponents.length === 0 ? (
            <EmptyState category={category} />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredComponents.map((component) => (
                <ComponentCard key={component.id} component={component} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
