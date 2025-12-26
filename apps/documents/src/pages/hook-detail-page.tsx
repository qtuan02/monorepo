import { useEffect } from "react";
import { Link, useParams } from "react-router";

import AppLayout from "~/components/app-layout";
import Breadcrumb from "~/components/breadcrumb";
import HookDetail from "~/components/hook-detail";
import { useHookById } from "~/lib/use-hook-metadata";

export default function HookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { hook, isLoading } = useHookById(id || "");

  useEffect(() => {
    if (hook) {
      document.title = `Hook | ${hook.name}`;
    }
  }, [hook]);

  // Loading state
  if (isLoading) {
    return (
      <AppLayout currentPath={`/hooks/${id || ""}`}>
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
      <AppLayout currentPath={`/hooks/${id || ""}`}>
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

  return (
    <AppLayout currentPath={`/hooks/${id || ""}`}>
      <div className="px-6 py-6 md:px-12">
        <div className="mx-auto max-w-7xl">
          <Breadcrumb
            items={[
              { label: "Home", path: "/" },
              { label: "Hooks", path: "/hooks" },
              { label: hook.name },
            ]}
            className="mb-6"
          />
          <HookDetail hook={hook} />
        </div>
      </div>
    </AppLayout>
  );
}
