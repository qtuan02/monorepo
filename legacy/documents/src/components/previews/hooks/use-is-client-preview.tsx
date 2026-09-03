import { useIsClient } from "@monorepo/hook";

export default function UseIsClientPreview() {
  const isClient = useIsClient();

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <div className="space-y-3 text-center">
        <div
          className={`inline-flex h-16 w-16 items-center justify-center rounded-full ${
            isClient
              ? "bg-green-100 dark:bg-green-900/30"
              : "bg-yellow-100 dark:bg-yellow-900/30"
          }`}
        >
          <span className="text-3xl">{isClient ? "✓" : "⏳"}</span>
        </div>
        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {isClient ? "Running on Client" : "Server-side Rendering"}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          This hook returns{" "}
          <code className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-900">
            {String(isClient)}
          </code>
        </p>
      </div>
    </div>
  );
}
