import { useEffect } from "react";

import Breadcrumb from "~/components/breadcrumb";
import HookCard from "~/components/hook-card";
import { useHookMetadata } from "~/hooks/use-hook-metadata";

export default function AllHooksPage() {
  const { hooks, isLoading } = useHookMetadata();

  useEffect(() => {
    document.title = "Hooks";
  }, []);

  // Sort all hooks alphabetically
  const sortedHooks = [...hooks].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <div className="px-4 py-4 md:px-12 md:py-6">
        <div className="mx-auto max-w-7xl">
          <Breadcrumb
            items={[{ label: "Home", path: "/" }, { label: "Hooks" }]}
            className="mb-4"
          />
          <div className="mb-6">
            <h1 className="text-3xl font-bold">All Hooks</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Browse all available custom React hooks
            </p>
          </div>

          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <div className="space-y-8">
              {/* All hooks section */}
              <section>
                <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  Custom Hooks
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {sortedHooks.map((hook) => (
                    <HookCard key={hook.id} hook={hook} />
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
