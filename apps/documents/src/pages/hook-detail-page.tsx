import { Link, useParams } from "react-router";

import AppLayout from "~/components/app-layout";
import HookDetail from "~/components/hook-detail";
import { hookCategoryToSlug } from "~/lib/hook-category-utils";
import { useHookById } from "~/lib/use-hook-metadata";

export default function HookDetailPage() {
  const params = useParams<{
    category?: string;
    id: string;
  }>();

  // Handle both /hooks/:id and /hooks/:category/:id patterns
  const id = params.id || params.category || "";
  const { hook, isLoading } = useHookById(id);

  // Loading state
  if (isLoading) {
    return (
      <AppLayout currentPath={`/hooks/${id}`}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900 dark:border-gray-600 dark:border-t-gray-100" />
            <p className="text-gray-600 dark:text-gray-400">Loading hook...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Hook not found
  if (!hook) {
    return (
      <AppLayout currentPath={`/hooks/${id}`}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
              Hook Not Found
            </h1>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              The hook &quot;{id}&quot; could not be found.
            </p>
            <Link
              to="/hooks"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              ← Back to Hooks
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Get category slug from hook metadata for breadcrumb compatibility
  const categorySlug = hookCategoryToSlug(hook.category);

  return (
    <AppLayout currentPath={`/hooks/${id}`}>
      {/* Breadcrumb Navigation */}
      <nav
        className="border-b border-gray-200 bg-gray-50 px-6 py-3 dark:border-gray-700 dark:bg-gray-800/50"
        aria-label="Breadcrumb"
        data-testid="breadcrumb"
      >
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link
              to="/"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Home
            </Link>
          </li>
          <li className="text-gray-400 dark:text-gray-500">/</li>
          <li>
            <Link
              to="/hooks"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Hooks
            </Link>
          </li>
          <li className="text-gray-400 dark:text-gray-500">/</li>
          <li className="font-medium text-gray-900 dark:text-gray-100">
            {hook.name}
          </li>
        </ol>
      </nav>

      {/* Hook Detail Content */}
      <div className="p-6 md:p-8">
        <HookDetail hook={hook} categorySlug={categorySlug} />
      </div>
    </AppLayout>
  );
}
