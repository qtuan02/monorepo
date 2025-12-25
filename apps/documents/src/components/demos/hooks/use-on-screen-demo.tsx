import { useRef } from "react";

import { useOnScreen } from "@monorepo/hook";

export default function UseOnScreenDemo() {
  const ref1 = useRef<HTMLDivElement>(null);
  const ref2 = useRef<HTMLDivElement>(null);
  const ref3 = useRef<HTMLDivElement>(null);

  const isVisible1 = useOnScreen(ref1);
  const isVisible2 = useOnScreen(ref2);
  const isVisible3 = useOnScreen(ref3);

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Scroll to see which elements are visible on screen:
      </p>
      <div className="h-64 space-y-4 overflow-y-auto rounded-md border border-gray-300 p-4 dark:border-gray-600">
        <div
          ref={ref1}
          className={`rounded-md p-4 transition-colors ${
            isVisible1
              ? "border-green-500 bg-green-100 dark:bg-green-900/30"
              : "border-gray-300 bg-gray-100 dark:bg-gray-700"
          } border-2`}
        >
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            Box 1 {isVisible1 ? "✓ Visible" : "✗ Not Visible"}
          </p>
        </div>
        <div className="h-32" /> {/* Spacer */}
        <div
          ref={ref2}
          className={`rounded-md p-4 transition-colors ${
            isVisible2
              ? "border-green-500 bg-green-100 dark:bg-green-900/30"
              : "border-gray-300 bg-gray-100 dark:bg-gray-700"
          } border-2`}
        >
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            Box 2 {isVisible2 ? "✓ Visible" : "✗ Not Visible"}
          </p>
        </div>
        <div className="h-32" /> {/* Spacer */}
        <div
          ref={ref3}
          className={`rounded-md p-4 transition-colors ${
            isVisible3
              ? "border-green-500 bg-green-100 dark:bg-green-900/30"
              : "border-gray-300 bg-gray-100 dark:bg-gray-700"
          } border-2`}
        >
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            Box 3 {isVisible3 ? "✓ Visible" : "✗ Not Visible"}
          </p>
        </div>
      </div>
    </div>
  );
}
