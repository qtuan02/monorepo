import { useState } from "react";

import { useTimeout } from "@monorepo/hook";

export default function UseTimeoutDemo() {
  const [message, setMessage] = useState("");
  const [delay, setDelay] = useState(3000);
  const [key, setKey] = useState(0); // Use key to reset timeout

  // Reset and trigger new timeout
  const resetTimeout = () => {
    setMessage("Timeout started...");
    setKey((prev) => prev + 1);
  };

  // Use the timeout hook
  useTimeout(
    () => {
      setMessage("Timeout completed!");
    },
    message === "Timeout started..." ? delay : null,
  );

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <div className="space-y-2">
        <label
          htmlFor="delay-input"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Delay (ms):
        </label>
        <input
          id="delay-input"
          type="number"
          value={delay}
          onChange={(e) => setDelay(Number(e.target.value))}
          min="1000"
          max="10000"
          step="1000"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
      </div>
      <button
        onClick={resetTimeout}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
      >
        Start Timeout
      </button>
      {message && (
        <div className="rounded-md bg-gray-50 p-4 dark:bg-gray-900">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {message}
          </p>
        </div>
      )}
    </div>
  );
}
