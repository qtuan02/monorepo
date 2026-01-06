import { useLocalStorage } from "@monorepo/hook";

export default function UseLocalStoragePreview() {
  const [name, setName] = useLocalStorage("preview-name", "");
  const [count, setCount] = useLocalStorage("preview-count", 0);

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <div className="space-y-2">
        <label
          htmlFor="name-input"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Your Name (persisted):
        </label>
        <input
          id="name-input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Counter (persisted): {count}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setCount(count + 1)}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
          >
            Increment
          </button>
          <button
            onClick={() => setCount(0)}
            className="rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
          >
            Reset
          </button>
        </div>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        💡 Reload the page to see values persist in localStorage
      </p>
    </div>
  );
}
