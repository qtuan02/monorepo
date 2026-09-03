import { useState } from "react";

import { Button } from "@monorepo/ui/components/button";

// Preview implementation since useFetch expects a URL
function useFetchPreview<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(url);
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: fetchData };
}

interface Todo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

export default function UseFetchPreview() {
  const [url, setUrl] = useState<string | null>(null);
  const { data, loading, error, refetch } = useFetchPreview<Todo>(url);

  const handleFetch = () => {
    setUrl("https://jsonplaceholder.typicode.com/todos/1");
  };

  // Trigger fetch when URL changes
  if (url && !data && !loading && !error) {
    refetch();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Click the button to fetch a sample TODO item from JSONPlaceholder API
        </p>
        <Button onClick={handleFetch} disabled={loading}>
          {loading ? "Fetching..." : "Fetch Data"}
        </Button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
        <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Result:
        </h4>
        {loading && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="size-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
            Loading...
          </div>
        )}
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">
            Error: {error.message}
          </p>
        )}
        {data && (
          <pre className="overflow-x-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-800">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
        {!loading && !error && !data && (
          <p className="text-sm text-gray-500">No data fetched yet</p>
        )}
      </div>
    </div>
  );
}
