import { useRef } from "react";

import { useHover } from "@monorepo/hook";

export default function UseHoverPreview() {
  const hoverRef = useRef<HTMLDivElement>(null!);
  const isHovered = useHover(hoverRef);

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Hover over the box below to see the hook in action:
      </p>
      <div
        ref={hoverRef}
        className={`cursor-pointer rounded-lg p-8 text-center transition-all duration-300 ${
          isHovered
            ? "scale-105 bg-blue-600 text-white shadow-lg"
            : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
        }`}
      >
        <p className="text-lg font-semibold">
          {isHovered ? "🎉 Hovering!" : "👋 Hover me!"}
        </p>
      </div>
      <div className="rounded-md bg-gray-50 p-3 dark:bg-gray-900">
        <code className="text-xs text-gray-700 dark:text-gray-300">
          isHovered: {String(isHovered)}
        </code>
      </div>
    </div>
  );
}
