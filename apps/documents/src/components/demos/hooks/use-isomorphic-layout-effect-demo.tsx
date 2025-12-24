import { useEffect, useState } from "react";

import { useIsomorphicLayoutEffect } from "@monorepo/hook";

export default function UseIsomorphicLayoutEffectDemo() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [renderCount, setRenderCount] = useState(0);

  // This hook will use useLayoutEffect on client, useEffect on server
  const useIsomorphic = useIsomorphicLayoutEffect();

  useIsomorphic(() => {
    // Measure window dimensions
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    setRenderCount((prev) => prev + 1);
  }, [dimensions]);

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Window Dimensions
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Resize your browser window to see updates
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Width
          </p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {dimensions.width}px
          </p>
        </div>
        <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Height
          </p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {dimensions.height}px
          </p>
        </div>
      </div>
      <div className="rounded-md bg-gray-50 p-3 dark:bg-gray-900">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Renders: {renderCount} • Uses{" "}
          <code className="bg-gray-200 px-1 dark:bg-gray-800">
            useLayoutEffect
          </code>{" "}
          on client,{" "}
          <code className="bg-gray-200 px-1 dark:bg-gray-800">useEffect</code>{" "}
          on server
        </p>
      </div>
    </div>
  );
}
