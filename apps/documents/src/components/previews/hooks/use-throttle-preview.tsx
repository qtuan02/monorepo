import { useState } from "react";

import { useThrottle } from "@monorepo/hook";

export default function UseThrottlePreview() {
  const [value, setValue] = useState("");
  const throttledValue = useThrottle(value, 1000);

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <div className="space-y-2">
        <label
          htmlFor="throttle-input"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Type to see throttling (1000ms):
        </label>
        <input
          id="throttle-input"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Start typing..."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
      </div>
      <div className="space-y-1 rounded-md bg-gray-50 p-4 dark:bg-gray-900">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-semibold">Immediate value:</span> {value}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-semibold">Throttled value:</span>{" "}
          {throttledValue}
        </p>
      </div>
    </div>
  );
}
