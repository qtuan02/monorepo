import type { HookReturn } from "~/types/hook-metadata";

interface ReturnValueProps {
  returns: HookReturn;
}

export default function ReturnValue({ returns }: ReturnValueProps) {
  if (!returns || !returns.type) {
    return (
      <div
        className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800"
        data-testid="return-value-empty"
      >
        <p className="text-gray-500 dark:text-gray-400">
          This hook returns void.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900"
      data-testid="return-value"
    >
      <div className="space-y-4">
        {/* Return Type */}
        <div>
          <h3 className="mb-2 text-sm font-medium text-gray-500 uppercase dark:text-gray-400">
            Type
          </h3>
          <code
            className="block rounded-lg bg-gray-100 p-4 font-mono text-sm text-purple-600 dark:bg-gray-800 dark:text-purple-400"
            data-testid="return-type"
          >
            {returns.type}
          </code>
        </div>

        {/* Return Description */}
        {returns.description && (
          <div>
            <h3 className="mb-2 text-sm font-medium text-gray-500 uppercase dark:text-gray-400">
              Description
            </h3>
            <p
              className="text-gray-700 dark:text-gray-300"
              data-testid="return-description"
            >
              {returns.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
