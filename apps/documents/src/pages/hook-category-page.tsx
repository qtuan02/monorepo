import { useParams, useSearchParams } from "react-router";

import {
  isValidHookCategorySlug,
  slugToHookCategory,
  filterHooksByCategory,
} from "~/lib/hook-category-utils";
import {
  getPackageFilterFromUrl,
  filterHooksByPackage,
} from "~/lib/package-filter-utils";
import AppLayout from "~/components/app-layout";
import HookCard from "~/components/hook-card";
import EmptyState from "~/components/empty-state";
import PackageFilter from "~/components/package-filter";
import { useHookMetadata } from "~/lib/use-hook-metadata";

export default function HookCategoryPage() {
  const { category: categorySlug } = useParams<{ category: string }>();
  const [searchParams] = useSearchParams();
  const { hooks, isLoading } = useHookMetadata();

  if (!categorySlug || !isValidHookCategorySlug(categorySlug)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
            Invalid Category
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            The hook category "{categorySlug}" does not exist.
          </p>
        </div>
      </div>
    );
  }

  const category = slugToHookCategory(categorySlug);
  const packageFilter = getPackageFilterFromUrl(searchParams);
  
  // Apply both category and package filters
  let filteredHooks = filterHooksByCategory(hooks, categorySlug);
  filteredHooks = filterHooksByPackage(filteredHooks, packageFilter);

  return (
    <AppLayout currentPath={`/hooks/${categorySlug}`}>
      <div className="p-6 md:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">{category}</h1>
          <PackageFilter />
        </div>
        {isLoading ? (
          <div>Loading...</div>
        ) : filteredHooks.length === 0 ? (
          <EmptyState category={category} />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredHooks.map((hook) => (
              <HookCard key={hook.id} hook={hook} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

