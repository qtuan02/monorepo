import AppLayout from "~/components/app-layout";
import Breadcrumb from "~/components/breadcrumb";
import HookCard from "~/components/hook-card";
import { useHookMetadata } from "~/lib/use-hook-metadata";

export default function AllHooksPage() {
  const { hooks, isLoading } = useHookMetadata();

  // Sort hooks alphabetically
  const sortedHooks = [...hooks].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <AppLayout currentPath="/hooks">
      <div className="px-6 py-6 md:px-12">
        <div className="mx-auto max-w-7xl">
          <Breadcrumb
            items={[{ label: "Home", path: "/" }, { label: "Hooks" }]}
            className="mb-4"
          />
          <div className="mb-6">
            <h1 className="text-3xl font-bold">All Hooks</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Browse all available React hooks for common functionality
            </p>
          </div>

          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sortedHooks.map((hook) => (
                <HookCard key={hook.id} hook={hook} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
