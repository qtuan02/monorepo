import { useIsMobile } from "@monorepo/hook";

export default function UseIsMobilePreview() {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <div className="space-y-4">
        <div className="rounded-md bg-gray-50 p-4 dark:bg-gray-900">
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Current Device:{" "}
            <span
              className={
                isMobile
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-green-600 dark:text-green-400"
              }
            >
              {isMobile ? "📱 Mobile" : "💻 Desktop"}
            </span>
          </p>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          💡 Try resizing your browser window to see the value change
        </p>
        <div className="rounded-md border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900">
          <p className="font-mono text-xs text-gray-700 dark:text-gray-300">
            isMobile: {isMobile.toString()}
          </p>
        </div>
      </div>
    </div>
  );
}
