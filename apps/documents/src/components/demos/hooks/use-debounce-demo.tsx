import { useState } from "react";

import { useDebounce } from "@monorepo/hook";

export default function UseDebounceDemo() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <div className="space-y-2">
        <label
          htmlFor="search-input"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Type to search (500ms debounce):
        </label>
        <input
          id="search-input"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Start typing..."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
      </div>
      <div className="space-y-1 rounded-md bg-gray-50 p-4 dark:bg-gray-900">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-semibold">Immediate value:</span> {searchTerm}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-semibold">Debounced value:</span>{" "}
          {debouncedSearch}
        </p>
      </div>
    </div>
  );
}
