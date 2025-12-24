import { useState } from "react";

import { useCountdown } from "@monorepo/hook";

export default function UseCountdownDemo() {
  const [timeLeft, reset] = useCountdown(10); // 10 second countdown

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <div className="space-y-4 text-center">
        <div className="text-6xl font-bold text-blue-600 dark:text-blue-400">
          {timeLeft}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {timeLeft > 0 ? "Counting down..." : "Time's up!"}
        </p>
        <button
          onClick={reset}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
        >
          Reset Countdown
        </button>
      </div>
    </div>
  );
}
