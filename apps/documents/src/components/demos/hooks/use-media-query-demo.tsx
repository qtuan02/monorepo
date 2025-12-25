import { useMediaQuery } from "@monorepo/hook";

export default function UseMediaQueryDemo() {
  const isSmall = useMediaQuery("(max-width: 640px)");
  const isMedium = useMediaQuery("(min-width: 641px) and (max-width: 1024px)");
  const isLarge = useMediaQuery("(min-width: 1025px)");
  const isDark = useMediaQuery("(prefers-color-scheme: dark)");

  const activeSize = isSmall ? "Small" : isMedium ? "Medium" : "Large";

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Current Screen Size: {activeSize}
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div
              className={`h-4 w-4 rounded-full ${isSmall ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Small (≤ 640px): {String(isSmall)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`h-4 w-4 rounded-full ${isMedium ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Medium (641-1024px): {String(isMedium)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`h-4 w-4 rounded-full ${isLarge ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Large (≥ 1025px): {String(isLarge)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`h-4 w-4 rounded-full ${isDark ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Dark Mode: {String(isDark)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
