import { useNetworkStatus } from "@monorepo/hook";

export default function UseNetworkStatusDemo() {
  const isOnline = useNetworkStatus();

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <div className="space-y-3 text-center">
        <div
          className={`inline-flex h-16 w-16 items-center justify-center rounded-full ${
            isOnline
              ? "bg-green-100 dark:bg-green-900/30"
              : "bg-red-100 dark:bg-red-900/30"
          }`}
        >
          <span className="text-3xl">{isOnline ? "🌐" : "⚠️"}</span>
        </div>
        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {isOnline ? "You are Online" : "You are Offline"}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Try toggling your network connection to see this update.
        </p>
        <div className="rounded-md bg-gray-50 p-3 dark:bg-gray-900">
          <code className="text-xs text-gray-700 dark:text-gray-300">
            isOnline: {String(isOnline)}
          </code>
        </div>
      </div>
    </div>
  );
}
