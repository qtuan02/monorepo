import { useState } from "react";

import { useCopyToClipboard } from "@monorepo/hook";

export default function UseCopyToClipboardDemo() {
  const [text, setText] = useState("Hello, copy me!");
  const { copied, copy } = useCopyToClipboard();

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <div className="space-y-2">
        <label
          htmlFor="copy-input"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Text to copy:
        </label>
        <input
          id="copy-input"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => copy(text)}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
        >
          {copied ? "✓ Copied!" : "Copy to Clipboard"}
        </button>
        {copied && (
          <span className="text-sm text-green-600 dark:text-green-400">
            Text copied successfully!
          </span>
        )}
      </div>
    </div>
  );
}
